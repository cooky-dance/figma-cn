// 隔离世界内容脚本：主世界的 page-hook.js 拿不到 chrome.* API，
// 这里负责把扩展设置（以及可选的 DOM 补充词典）通过 DOM 事件交给它。
// 主词典不走这里——它作为内容脚本 dict/web-zh-cn.js 直接加载到主世界。
(function () {
  'use strict';
  var DEFAULTS = { enabled: true, domFallback: false };
  var answered = { settings: false, dom: false };

  function send(type, payload) {
    document.dispatchEvent(new CustomEvent('figma-zh:' + type, { detail: payload }));
  }

  var settingsP = new Promise(function (resolve) {
    try { chrome.storage.sync.get(DEFAULTS, function (s) { resolve(s || DEFAULTS); }); }
    catch (e) { resolve(DEFAULTS); }
  });

  document.addEventListener('figma-zh:need-settings', function () {
    if (answered.settings) return;
    answered.settings = true;
    settingsP.then(function (s) { send('settings', JSON.stringify({ enabled: !!s.enabled, domFallback: !!s.domFallback })); });
  });

  // DOM 补充词典需在 manifest 的 web_accessible_resources 中声明，否则内容脚本的 fetch 会被拒绝
  document.addEventListener('figma-zh:need-dom', function () {
    if (answered.dom) return;
    answered.dom = true;
    fetch(chrome.runtime.getURL('dict/dom-fallback.json'))
      .then(function (r) { return r.text(); })
      .then(function (t) { send('dom', t); }, function () { send('dom', null); });
  });

  // 主世界脚本可能先于本脚本运行并已发出请求：通知它再问一次。
  send('bridge-ready', null);
})();
