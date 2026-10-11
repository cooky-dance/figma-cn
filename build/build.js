// 构建浏览器扩展。
// 用法：node build/build.js
//
// 输入：translations/web/zh-cn.json（Figma 词条 key → 中文），仓库里只提交这一份。
// 如果本地还有 source/web-en.json（Figma 英文词典）和 translations/web/zh-cn.by-en.json（按英文原文的翻译记忆），
// 会先用它们重新生成 zh-cn.json——这两份含 Figma 的英文原文，不随仓库分发，由 build/update-source.js 在本地生成。
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const p = (...a) => path.join(ROOT, ...a);
const readJson = f => JSON.parse(fs.readFileSync(f, 'utf8'));
const writeJson = (f, v, pretty) => { fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, JSON.stringify(v, null, pretty ? 1 : 0)); };

const upstreamEntries = readJson(p('vendor', 'figmaCN', 'translations.json'));
const byKeyPath = p('translations', 'web', 'zh-cn.json');
const enPath = p('source', 'web-en.json');
const tmPath = p('translations', 'web', 'zh-cn.by-en.json');

// ---- 可选：从英文词典 + 翻译记忆重新生成按 key 的词典 ----
if (fs.existsSync(enPath) && fs.existsSync(tmPath)) {
  const webEn = readJson(enPath); // { key: { string } }
  const tm = readJson(tmPath);    // { english: chinese }
  const upstream = new Map(upstreamEntries.filter(([k]) => k && !k.includes('{@}')).map(([k, v]) => [k.trim(), v]));
  const out = {};
  let fromTm = 0, fromUp = 0, missing = 0;
  for (const key of Object.keys(webEn).sort()) {
    const en = webEn[key].string;
    if (tm[en] != null) { out[key] = tm[en]; fromTm++; continue; }
    const t = en.trim();
    if (upstream.has(t)) {
      const lead = en.slice(0, en.length - en.trimStart().length), trail = en.slice(en.trimEnd().length);
      out[key] = lead + upstream.get(t).trim() + trail; fromUp++; continue;
    }
    if (/[A-Za-z]/.test(en)) missing++;
  }
  writeJson(byKeyPath, out, true);
  console.log(`已重新生成 zh-cn.json：${Object.keys(out).length}/${Object.keys(webEn).length}（翻译记忆 ${fromTm}，figmaCN ${fromUp}，未翻译 ${missing}）`);
}

const webZh = readJson(byKeyPath);

// ---- 主世界脚本：hook + DOM 兜底 + 入口 ----
const hookSrc = fs.readFileSync(p('src', 'hook.js'), 'utf8').replace(/\nif \(typeof module[^\n]*\n?/, '\n');
const upstreamContent = fs.readFileSync(p('vendor', 'figmaCN', 'content.js'), 'utf8');
const i = upstreamContent.indexOf('function initializeTranslation(allData)');
if (i < 0) throw new Error('上游 content.js 结构变化，找不到 initializeTranslation');
const domSrc = '// 以下 DOM 兜底翻译改编自 figmaCN（https://github.com/yancymin/figmaCN，GPL-3.0）\n'
  + upstreamContent.slice(i).replace('function initializeTranslation(allData)', 'function figmaZhDomFallback(allData)');
const pageMain = fs.readFileSync(p('extension', 'src', 'page-main.js'), 'utf8');
const pageHook = `/* Figma 简体中文 · 主世界脚本（构建生成，勿直接编辑） */\n${hookSrc}\n${domSrc}\n${pageMain}`;

const meta = { entries: Object.keys(webZh).length, built: new Date().toISOString().slice(0, 10) };

// ---- 扩展 ----
// 主词典做成内容脚本（主世界同步可用）。不要改回 fetch 读 JSON：MV3 下内容脚本 fetch 扩展内文件
// 需要 web_accessible_resources，漏配就会静默失败、界面保持英文。
fs.mkdirSync(p('extension', 'dict'), { recursive: true });
fs.writeFileSync(p('extension', 'dict', 'web-zh-cn.js'), 'self.__FIGMA_ZH_DICT__=JSON.parse(' + JSON.stringify(JSON.stringify(webZh)) + ');' + String.fromCharCode(10));
writeJson(p('extension', 'dict', 'dom-fallback.json'), upstreamEntries);
writeJson(p('extension', 'dict', 'meta.json'), meta, true);
fs.mkdirSync(p('extension', 'js'), { recursive: true });
fs.writeFileSync(p('extension', 'js', 'page-hook.js'), pageHook);
fs.copyFileSync(p('extension', 'src', 'bridge.js'), p('extension', 'js', 'bridge.js'));
fs.copyFileSync(p('vendor', 'figmaCN', 'LICENSE'), p('extension', 'LICENSE'));

// 可直接「加载解压缩的扩展」的干净目录（不含 src/）
const dist = p('dist', 'figma-zh-extension');
fs.rmSync(dist, { recursive: true, force: true });
// 不用 fs.cpSync：它在含中文的 Windows 路径上会失败
const copy = (from, to) => {
  if (fs.statSync(from).isDirectory()) {
    fs.mkdirSync(to, { recursive: true });
    for (const f of fs.readdirSync(from)) copy(path.join(from, f), path.join(to, f));
  } else fs.writeFileSync(to, fs.readFileSync(from));
};
for (const item of ['manifest.json', 'popup.html', 'LICENSE', 'img', 'js', 'dict']) copy(p('extension', item), path.join(dist, item));

console.log(`扩展已构建：${meta.entries} 条 → dist/figma-zh-extension`);
