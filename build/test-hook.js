// 在 Node 中模拟页面环境，验证 hook 能把 figma.com 真实英文词典替换成中文。
// 用法：node build/test-hook.js <figma 词典 URL>
const path = require('path');
const fs = require('fs');
const { figmaZhInstallHook } = require('../src/hook.js');

const url = process.argv[2] || 'https://www.figma.com/webpack-artifacts/assets/auth-3f44a57f11a485f9.min.en.json.br';
const dict = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'translations', 'web', 'zh-cn.json'), 'utf8'));
globalThis.window = globalThis;
figmaZhInstallHook(() => Promise.resolve(dict), { version: 'test' });

(async () => {
  const data = await (await window.fetch(url)).json();
  const keys = Object.keys(data);
  const zh = keys.filter(k => /[一-鿿]/.test(data[k].string));
  console.log(`键 ${keys.length}，已中文 ${zh.length}`);
  for (const k of zh.slice(0, 8)) console.log('  ' + k + ' → ' + data[k].string);
  const other = await window.fetch('https://www.figma.com/robots.txt');
  console.log('非词典请求不受影响：', other.status, (await other.text()).slice(0, 30).replace(/\n/g, ' '));
  console.log('统计：', JSON.stringify(window.__figmaZhHook.stats.files));
})();
