// 主世界入口（构建时与 src/hook.js、dom-fallback 拼接成 js/page-hook.js）。
// 词典由同一组内容脚本里排在前面的 dict/web-zh-cn.js 同步放到 self.__FIGMA_ZH_DICT__，
// 这里取走后立刻删除该全局变量。只有"是否启用"这类设置需要向隔离世界的 bridge.js 询问。
(function () {
  'use strict';
  if (window.__figmaZhPage) return;
  window.__figmaZhPage = true;

  var dict = self.__FIGMA_ZH_DICT__ || null;
  try { delete self.__FIGMA_ZH_DICT__; } catch (e) { self.__FIGMA_ZH_DICT__ = undefined; }

  // 向 bridge 请求数据；超时返回 fallback（bridge 没加载到时默认按"启用"处理）
  function request(type, timeoutMs, fallback) {
    return new Promise(function (resolve) {
      var done = false;
      var finish = function (v) { if (done) return; done = true; document.removeEventListener('figma-zh:' + type, onData); resolve(v); };
      function onData(e) {
        var text = e.detail;
        try { finish(typeof text === 'string' ? JSON.parse(text) : null); } catch (err) { finish(fallback); }
      }
      document.addEventListener('figma-zh:' + type, onData);
      var ask = function () { document.dispatchEvent(new CustomEvent('figma-zh:need-' + type)); };
      document.addEventListener('figma-zh:bridge-ready', ask);
      ask();
      setTimeout(function () { finish(fallback); }, timeoutMs);
    });
  }

  var settings = request('settings', 1500, { enabled: true, domFallback: false });

  figmaZhInstallHook(function () {
    return settings.then(function (s) { return s && s.enabled === false ? null : dict; });
  }, { version: 'extension' });

  settings.then(function (s) {
    if (!s || s.enabled === false || !s.domFallback) return;
    request('dom', 8000, null).then(function (entries) {
      if (!entries) return;
      var start = function () { figmaZhDomFallback(entries); };
      if (document.body) start(); else document.addEventListener('DOMContentLoaded', start, { once: true });
    });
  });
})();
