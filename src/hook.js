// Figma 中文词典钩子。
// Figma 网页通过 <link id="englishDictionaryUrl"> + fetch() 加载 *.min.en.json 英文词典，
// 这里在页面脚本运行前包装 window.fetch，把响应里每个 key 的 string 换成中文。
// 未翻译的 key 保持英文，因此 Figma 新增词条时不会报错，只会显示英文。
//
// 本函数会被 toString() 后注入页面主世界，必须保持自包含（不能引用外部变量）。
// getDict: () => Promise<{[key: string]: string} | null>
function figmaZhInstallHook(getDict, options) {
  'use strict';
  if (window.__figmaZhHook) return;
  var opts = options || {};
  var DICT_URL = /\/webpack-artifacts\/assets\/[^?#]*\.min\.en\.json(?:\.br)?(?:[?#]|$)/;
  var TIMEOUT_MS = opts.timeoutMs || 8000;
  var stats = { replaced: 0, total: 0, files: [] };
  var dictPromise = null;

  function loadDict() {
    if (!dictPromise) {
      var timer = new Promise(function (resolve) { setTimeout(function () { resolve(null); }, TIMEOUT_MS); });
      dictPromise = Promise.race([Promise.resolve().then(getDict), timer]).catch(function (e) {
        console.warn('[figma-zh] 词典加载失败，保持英文', e);
        return null;
      });
    }
    return dictPromise;
  }

  function urlOf(input) {
    if (typeof input === 'string') return input;
    if (input && typeof input.url === 'string') return input.url;
    try { return String(input); } catch (e) { return ''; }
  }

  function localize(response, url) {
    return Promise.all([loadDict(), response.clone().json()]).then(function (r) {
      var dict = r[0], data = r[1];
      if (!dict || !data || typeof data !== 'object') return response;
      var n = 0, total = 0;
      for (var key in data) {
        var entry = data[key];
        if (!entry || typeof entry.string !== 'string') continue;
        total++;
        var zh = dict[key];
        if (typeof zh === 'string' && zh) { entry.string = zh; n++; }
      }
      stats.replaced += n; stats.total += total;
      stats.files.push({ url: url, replaced: n, total: total });
      console.info('[figma-zh] 已汉化 ' + n + ' / ' + total + ' 条：' + url.split('/').pop());
      var headers = new Headers(response.headers);
      headers.delete('content-length');
      headers.delete('content-encoding');
      headers.set('content-type', 'application/json; charset=utf-8');
      return new Response(JSON.stringify(data), { status: response.status, statusText: response.statusText, headers: headers });
    }).catch(function (e) {
      console.warn('[figma-zh] 替换词典失败，保持英文', e);
      return response;
    });
  }

  var nativeFetch = window.fetch;
  var wrapped = function fetch(input, init) {
    var url = urlOf(input);
    var p = nativeFetch.apply(this, arguments);
    if (!DICT_URL.test(url)) return p;
    return p.then(function (res) { return res && res.ok ? localize(res, url) : res; });
  };
  try { Object.defineProperty(wrapped, 'toString', { value: function () { return nativeFetch.toString(); } }); } catch (e) {}
  window.fetch = wrapped;
  window.__figmaZhHook = { stats: stats, version: opts.version || '' };
  loadDict();
}

if (typeof module !== 'undefined') module.exports = { figmaZhInstallHook: figmaZhInstallHook };
