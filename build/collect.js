// 把翻译批次（bNNN.json + bNNN.zh.json）合并进翻译记忆 translations/web/zh-cn.by-en.json。
// 用法：node build/collect.js <批次目录> [--shell <shell批次目录>]
// 只收录通过 validate.js 校验的批次。
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const VALIDATE = path.join(ROOT, 'translations', 'validate.js');
const args = process.argv.slice(2);
const batchDir = args[0];
const shellIdx = args.indexOf('--shell');
const shellDir = shellIdx >= 0 ? args[shellIdx + 1] : null;

function valid(dir, name) {
  try { execFileSync(process.execPath, [VALIDATE, dir, name], { stdio: 'pipe' }); return true; }
  catch (e) { console.log(String(e.stdout || e.message).split('\n')[0]); return false; }
}

function pairs(dir, name) {
  const src = JSON.parse(fs.readFileSync(path.join(dir, name + '.json'), 'utf8'));
  const zh = JSON.parse(fs.readFileSync(path.join(dir, name + '.zh.json'), 'utf8'));
  return src.map(([id, key, en]) => [key, en, zh[id] ?? zh[String(id)]]);
}

if (batchDir) {
  const tmPath = path.join(ROOT, 'translations', 'web', 'zh-cn.by-en.json');
  const tm = fs.existsSync(tmPath) ? JSON.parse(fs.readFileSync(tmPath, 'utf8')) : {};
  let ok = 0, bad = [];
  for (const f of fs.readdirSync(batchDir).filter(f => /^b[\w]+\.json$/.test(f) && !f.endsWith('.zh.json')).sort()) {
    const name = f.slice(0, -5);
    if (!fs.existsSync(path.join(batchDir, name + '.zh.json')) || !valid(batchDir, name)) { bad.push(name); continue; }
    for (const [, en, zh] of pairs(batchDir, name)) tm[en] = zh;
    ok++;
  }
  const sorted = Object.fromEntries(Object.entries(tm).sort(([a], [b]) => a.localeCompare(b)));
  fs.mkdirSync(path.dirname(tmPath), { recursive: true });
  fs.writeFileSync(tmPath, JSON.stringify(sorted, null, 1));
  console.log(`网页批次：合并 ${ok} 批，跳过 ${bad.length} 批 ${bad.join(' ')}；翻译记忆共 ${Object.keys(tm).length} 条`);
}

if (shellDir) {
  if (!valid(shellDir, 'shell')) process.exit(1);
  const out = {};
  for (const [key, , zh] of pairs(shellDir, 'shell')) out[key] = zh;
  const f = path.join(ROOT, 'translations', 'shell', 'zh-cn.json');
  fs.mkdirSync(path.dirname(f), { recursive: true });
  fs.writeFileSync(f, JSON.stringify(out, null, 1));
  console.log(`桌面外壳：${Object.keys(out).length} 条`);
}
