(function () {
  'use strict';
  var DEFAULTS = { enabled: true, domFallback: false };
  var $ = function (id) { return document.getElementById(id); };

  chrome.storage.sync.get(DEFAULTS, function (s) {
    $('enabled').checked = !!s.enabled;
    $('domFallback').checked = !!s.domFallback;
  });
  ['enabled', 'domFallback'].forEach(function (id) {
    $(id).addEventListener('change', function () {
      var v = {}; v[id] = $(id).checked;
      chrome.storage.sync.set(v);
      $('stats').textContent = '设置已保存，刷新 Figma 页面后生效';
    });
  });

  fetch(chrome.runtime.getURL('dict/meta.json')).then(function (r) { return r.json(); }).then(function (m) {
    $('stats').textContent = '词典 ' + m.entries.toLocaleString() + ' 条 · ' + m.built;
  }).catch(function () { $('stats').textContent = ''; });

  $('reload').addEventListener('click', function () {
    chrome.tabs.query({ url: ['https://www.figma.com/*', 'https://figma.com/*'] }, function (tabs) {
      (tabs || []).forEach(function (t) { chrome.tabs.reload(t.id); });
      window.close();
    });
  });
})();
