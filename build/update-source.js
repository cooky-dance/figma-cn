// Figma 网页版更新后使用：下载最新英文词典，找出翻译记忆里还没有的新词条，生成待翻译批次。
// 用法：node build/update-source.js [输出批次目录，默认 translations/pending]
// 词典地址取自 Figma 桌面版缓存（桌面版需登录并打开过一次设计文件）。
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const outDir = path.resolve(process.argv[2] || path.join(ROOT, 'translations', 'pending'));
const cacheRoot = path.join(process.env.APPDATA || '', 'Figma');
const BASE = 'https://www.figma.com/';

function findDictUrls() {
  const found = new Map(); // entry -> { url, mtime }
  const walk = dir => {
    let list = [];
    try { list = fs.readdirSync(dir, { withFileTypes: true }); } catch (e) { return; }
    for (const d of list) {
      const full = path.join(dir, d.name);
      if (d.isDirectory()) { walk(full); continue; }
      let st; try { st = fs.statSync(full); } catch (e) { continue; }
      if (st.size > 80 * 1024 * 1024) continue;
      let text; try { text = fs.readFileSync(full).toString('latin1'); } catch (e) { continue; }
      for (const m of text.matchAll(/webpack-artifacts\/assets\/([a-z_]+)-[0-9a-f]{16}\.min\.en\.json/g)) {
        const prev = found.get(m[1]);
        if (!prev || st.mtimeMs > prev.mtime) found.set(m[1], { url: BASE + m[0], mtime: st.mtimeMs });
      }
    }
  };
  walk(cacheRoot);
  return found;
}

(async () => {
  const urls = findDictUrls();
  if (!urls.size) { console.error('未在桌面版缓存中找到词典地址，请先登录 Figma 桌面版并打开一个设计文件。'); process.exit(1); }
  const srcPath = path.join(ROOT, 'source', 'web-en.json');
  const all = JSON.parse(fs.readFileSync(srcPath, 'utf8'));
  for (const [entry, { url }] of urls) {
    const res = await fetch(url);
    if (!res.ok) { console.warn(`跳过 ${entry}：HTTP ${res.status}`); continue; }
    const data = await res.json();
    Object.assign(all, data);
    console.log(`${entry}: ${Object.keys(data).length} 条  ${url}`);
  }
  fs.writeFileSync(srcPath, JSON.stringify(all));

  const tm = JSON.parse(fs.readFileSync(path.join(ROOT, 'translations', 'web', 'zh-cn.by-en.json'), 'utf8'));
  const upstream = new Set(JSON.parse(fs.readFileSync(path.join(ROOT, 'vendor', 'figmaCN', 'translations.json'), 'utf8')).map(([k]) => k.trim()));
  const seen = new Map();
  for (const k of Object.keys(all).sort()) {
    const v = all[k].string;
    if (!/[A-Za-z]/.test(v) || tm[v] != null || upstream.has(v.trim()) || seen.has(v)) continue;
    seen.set(v, k);
  }
  fs.mkdirSync(outDir, { recursive: true });
  let cur = [], chars = 0, n = 0;
  const flush = () => { if (!cur.length) return; n++; fs.writeFileSync(path.join(outDir, 'b' + String(n).padStart(3, '0') + '.json'), JSON.stringify(cur).replace(/\],\[/g, '],\n[')); cur = []; chars = 0; };
  for (const [v, k] of seen) {
    if (cur.length && (chars + v.length > 4500 || cur.length >= 110)) flush();
    cur.push([cur.length + 1, k, v]); chars += v.length;
  }
  flush();
  console.log(`新词条 ${seen.size} 条，已生成 ${n} 个待翻译批次 → ${outDir}`);
  console.log('翻译后运行：node build/collect.js <批次目录> && node build/build.js');
})();
