// 生成商店物料：图标、宣传图、截图。全部由代码渲染，输出到 store/。
// 用法：node build/make-store-assets.js [msedge|chrome]
//
// 截图里只有两类内容：
//   1) 真实截取：把扩展加载进浏览器后打开 figma.com 登录页；以及扩展自己的弹窗界面。
//   2) 自行设计的说明图（术语对照、特点），明确是说明图，不模拟 Figma 的界面。
// 不使用 Figma 的 logo。
const fs = require('fs');
const os = require('os');
const path = require('path');
const { chromium } = require('playwright-core');

const NAME = 'Figma FullCN';
const TAGLINE = 'Figma 网页版 · 简体中文界面';

const ROOT = path.resolve(__dirname, '..');
const EXT = path.join(ROOT, 'dist', 'figma-zh-extension');
const OUT = path.join(ROOT, 'store');
const channel = process.argv[2] || 'msedge';
const meta = JSON.parse(fs.readFileSync(path.join(EXT, 'dict', 'meta.json'), 'utf8'));
const COUNT = meta.entries.toLocaleString('en-US');
const LOGIN_CROP_TOP = 100; // 登录页实拍时从顶部裁掉的高度（像素）
fs.mkdirSync(OUT, { recursive: true });

const BASE_CSS = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { width: 100%; height: 100%; }
  body { font-family: "Microsoft YaHei UI", "Microsoft YaHei", "PingFang SC", system-ui, sans-serif; color: #fff; overflow: hidden;
         background: linear-gradient(135deg, #a259ff 0%, #5b7cfa 55%, #0d99ff 100%); }
  .mark { display: flex; align-items: center; justify-content: center; font-weight: 700; color: #fff;
          background: linear-gradient(135deg, #a259ff, #0d99ff); }
  .glass { background: rgba(255,255,255,.14); border: 1px solid rgba(255,255,255,.28); border-radius: 20px; }
  .card { background: #fff; color: #1e1e1e; border-radius: 20px; box-shadow: 0 24px 60px rgba(20,20,60,.28); }
  .muted { opacity: .86; }
`;
const page = (css, body) => `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><style>${BASE_CSS}${css}</style></head><body>${body}</body></html>`;

const logoHtml = page(`
  body { background: transparent; }
  .mark { width: 300px; height: 300px; border-radius: 66px; font-size: 168px; padding-bottom: 10px; }
`, `<div class="mark">中</div>`);

// 大宣传图（1400x560）：宽幅版式单独排，不能按小图等比放大（文字会溢出）
const promoWideHtml = page(`
  body { display: flex; align-items: center; padding: 0 60px; gap: 40px; }
  .mark { width: 150px; height: 150px; border-radius: 36px; font-size: 86px; padding-bottom: 6px; flex: none;
          background: rgba(255,255,255,.18); border: 2px solid rgba(255,255,255,.5); }
  .text { flex: none; }
  h1 { font-size: 74px; line-height: 1.1; letter-spacing: -1px; white-space: nowrap; }
  p { font-size: 28px; margin-top: 12px; white-space: nowrap; }
  .chips { display: flex; gap: 10px; margin-top: 26px; }
  .chip { font-size: 19px; padding: 7px 16px; border-radius: 999px; background: rgba(255,255,255,.2); border: 1px solid rgba(255,255,255,.35); white-space: nowrap; }
  .side { margin-left: auto; display: grid; grid-template-columns: 1fr 1fr; gap: 14px; width: 430px; flex: none; }
  .pair { padding: 14px 18px; border-radius: 16px; font-size: 17px; white-space: nowrap; }
  .pair b { display: block; font-size: 25px; margin-top: 2px; }
`, `
  <div class="mark">中</div>
  <div class="text">
    <h1>${NAME}</h1>
    <p class="muted">${TAGLINE}</p>
    <div class="chips"><span class="chip">${COUNT} 个词条</span><span class="chip">仅在 figma.com 运行</span><span class="chip">不收集数据</span></div>
  </div>
  <div class="side">
    ${[['Auto layout', '自动布局'], ['Components', '组件'], ['Prototype', '原型'], ['Version history', '版本历史']]
      .map(([en, zh]) => `<div class="glass pair"><span class="muted">${en}</span><b>${zh}</b></div>`).join('')}
  </div>`);

const promoHtml = (w, h) => {
  const s = h / 280; // 以小宣传图为基准缩放
  const wide = false;
  return page(`
    body { display: flex; align-items: center; padding: 0 ${wide ? 44 * s : 30 * s}px; gap: ${26 * s}px; }
    .mark { width: ${wide ? 108 * s : 92 * s}px; height: ${wide ? 108 * s : 92 * s}px; border-radius: ${24 * s}px; font-size: ${wide ? 60 * s : 52 * s}px;
            background: rgba(255,255,255,.18); border: ${1.5 * s}px solid rgba(255,255,255,.5); flex: none; }
    h1 { font-size: ${wide ? 46 * s : 34 * s}px; line-height: 1.15; letter-spacing: ${-0.5 * s}px; }
    p { font-size: ${wide ? 20 * s : 16 * s}px; margin-top: ${8 * s}px; }
    .chips { display: flex; gap: ${10 * s}px; margin-top: ${16 * s}px; flex-wrap: wrap; }
    .chip { font-size: ${wide ? 15 * s : 12.5 * s}px; padding: ${5 * s}px ${12 * s}px; border-radius: 999px; background: rgba(255,255,255,.2); border: 1px solid rgba(255,255,255,.35); white-space: nowrap; }
    .side { margin-left: auto; display: ${wide ? 'grid' : 'none'}; grid-template-columns: 1fr 1fr; gap: ${10 * s}px ${12 * s}px; width: ${330 * s}px; flex: none; }
    .pair { padding: ${9 * s}px ${14 * s}px; border-radius: ${12 * s}px; font-size: ${14 * s}px; }
    .pair b { display: block; font-size: ${18 * s}px; margin-top: ${1 * s}px; }
  `, `
    <div class="mark">中</div>
    <div>
      <h1>${NAME}</h1>
      <p class="muted">${TAGLINE}</p>
      <div class="chips"><span class="chip">${COUNT} 个词条</span><span class="chip">仅在 figma.com 运行</span><span class="chip">不收集数据</span></div>
    </div>
    <div class="side">
      ${[['Auto layout', '自动布局'], ['Components', '组件'], ['Prototype', '原型'], ['Version history', '版本历史']]
        .map(([en, zh]) => `<div class="glass pair"><span class="muted">${en}</span><b>${zh}</b></div>`).join('')}
    </div>`);
};

const TERMS = [
  ['Auto layout', '自动布局'], ['Components', '组件'], ['Variants', '变体'], ['Prototype', '原型'],
  ['Dev Mode', '开发模式'], ['Version history', '版本历史'], ['Layout grid', '布局网格'], ['Constraints', '约束'],
  ['Export', '导出'], ['Drafts', '草稿'], ['Plugins', '插件'], ['Share', '分享'],
];

const frameCss = `
  body { padding: 56px 64px; display: flex; flex-direction: column; }
  header { display: flex; align-items: center; gap: 18px; }
  header .mark { width: 56px; height: 56px; border-radius: 14px; font-size: 32px; background: rgba(255,255,255,.18); border: 1.5px solid rgba(255,255,255,.5); }
  header b { font-size: 26px; } header span { font-size: 17px; margin-left: auto; }
  h1 { font-size: 46px; line-height: 1.2; margin-top: 30px; letter-spacing: -.5px; }
  .sub { font-size: 21px; margin-top: 12px; }
  .note { font-size: 14px; margin-top: auto; padding-top: 18px; }
`;
const header = `<header><div class="mark">中</div><b>${NAME}</b><span class="muted">${TAGLINE}</span></header>`;

const termsHtml = page(frameCss + `
  .grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-top: 34px; }
  .t { padding: 18px 22px; }
  .t span { font-size: 16px; color: #6b6b6b; } .t b { display: block; font-size: 27px; margin-top: 4px; color: #1e1e1e; }
`, `${header}
  <h1>专业术语，统一译法</h1>
  <p class="sub muted">编辑器、文件浏览器、原型播放、管理后台，共 ${COUNT} 个词条。</p>
  <div class="grid">${TERMS.map(([en, zh]) => `<div class="card t"><span>${en}</span><b>${zh}</b></div>`).join('')}</div>
  <p class="note muted">说明图：展示部分术语的中英对照，非界面截图。</p>`);

const featuresHtml = page(frameCss + `
  .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-top: 34px; }
  .f { padding: 26px 30px; } .f b { font-size: 26px; display: block; } .f p { font-size: 18px; margin-top: 10px; line-height: 1.6; }
`, `${header}
  <h1>原生替换，而不是事后改字</h1>
  <p class="sub muted">在界面词典加载时换成中文，由网页自己渲染。</p>
  <div class="grid">
    <div class="glass f"><b>不会改到你的内容</b><p class="muted">不查找替换页面文字，图层名、文件名和画布内容都保持原样。</p></div>
    <div class="glass f"><b>变量与数量正确</b><p class="muted">带名称、数字的句子由网页自行填充，语序和单复数都不出错。</p></div>
    <div class="glass f"><b>更新不出错</b><p class="muted">网页新增的文字暂无译文时显示英文，不影响使用。</p></div>
    <div class="glass f"><b>权限最小</b><p class="muted">仅在 figma.com 运行，只使用本地存储保存开关，不联网、不收集数据。</p></div>
  </div>
  <p class="note muted">说明图：功能特点介绍，非界面截图。非 Figma 官方出品。</p>`);

const popupShotHtml = (imgB64, w, h) => page(frameCss + `
  .row { display: flex; gap: 56px; align-items: center; margin-top: 30px; flex: 1; }
  .shot { padding: 14px; flex: none; } .shot img { display: block; width: ${w * 1.5}px; height: ${h * 1.5}px; border-radius: 8px; }
  ol { font-size: 22px; line-height: 2.1; padding-left: 28px; }
`, `${header}
  <div class="row">
    <div class="card shot"><img src="data:image/png;base64,${imgB64}"></div>
    <div>
      <h1 style="margin-top:0">一个开关，随时切换</h1>
      <p class="sub muted">点击工具栏上的扩展图标即可。</p>
      <ol class="muted" style="margin-top:22px"><li>打开或关闭中文界面</li><li>按需启用补充翻译</li><li>刷新页面后生效</li></ol>
    </div>
  </div>
  <p class="note muted">左侧为扩展弹窗的实际界面。</p>`);

const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.json': 'application/json', '.png': 'image/png' };

(async () => {
  // ---- 说明图与扩展自身界面：普通无头浏览器 ----
  const browser = await chromium.launch({ channel, headless: true });
  const shot = async (html, w, h, file, opts = {}) => {
    const pg = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
    await pg.setContent(html, { waitUntil: 'load' });
    await pg.screenshot({ path: path.join(OUT, file), omitBackground: !!opts.transparent });
    await pg.close();
    console.log('✓', file, `${w}x${h}`);
  };

  await shot(logoHtml, 300, 300, 'logo-300x300.png', { transparent: true });
  await shot(promoHtml(440, 280), 440, 280, 'promo-small-440x280.png');
  await shot(promoWideHtml, 1400, 560, 'promo-large-1400x560.png');
  await shot(termsHtml, 1280, 800, 'screenshot-3-terms-1280x800.png');
  await shot(featuresHtml, 1280, 800, 'screenshot-4-features-1280x800.png');

  // 扩展弹窗：用真实的 popup.html / popup.js 渲染，chrome.* 接口以最小桩代替
  const pp = await browser.newPage({ viewport: { width: 280, height: 400 }, deviceScaleFactor: 2 });
  const ORIGIN = 'https://fullcn-popup.invalid';
  await pp.route(ORIGIN + '/**', route => {
    const rel = decodeURIComponent(new URL(route.request().url()).pathname).replace(/^\//, '');
    const f = path.join(EXT, rel);
    if (!fs.existsSync(f)) return route.fulfill({ status: 404, body: '' });
    route.fulfill({ status: 200, contentType: MIME[path.extname(f)] || 'application/octet-stream', body: fs.readFileSync(f) });
  });
  await pp.addInitScript(origin => {
    window.chrome = {
      storage: { sync: { get: (d, cb) => cb(d), set: () => {} } },
      runtime: { getURL: p => origin + '/' + p },
      tabs: { query: (q, cb) => cb([]), reload: () => {} },
    };
  }, ORIGIN);
  await pp.goto(ORIGIN + '/popup.html');
  await pp.waitForFunction(() => /条/.test(document.getElementById('stats').textContent), null, { timeout: 10000 });
  const box = await pp.evaluate(() => ({ w: document.body.offsetWidth, h: document.body.offsetHeight }));
  const popupPng = await pp.screenshot({ clip: { x: 0, y: 0, width: box.w, height: box.h } });
  await pp.close();
  await shot(popupShotHtml(popupPng.toString('base64'), box.w, box.h), 1280, 800, 'screenshot-2-popup-1280x800.png');
  await browser.close();

  // ---- 真实截图：加载扩展后打开 figma.com 登录页（临时用户目录，用完即删） ----
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'fullcn-shot-'));
  const ctx = await chromium.launchPersistentContext(profile, {
    channel, headless: false, viewport: { width: 1280, height: 800 + LOGIN_CROP_TOP }, deviceScaleFactor: 1, locale: 'zh-CN',
    args: ['--headless=new', `--disable-extensions-except=${EXT}`, `--load-extension=${EXT}`, '--no-first-run', '--no-default-browser-check'],
  });
  try {
    const pg = ctx.pages()[0] || await ctx.newPage();
    await pg.goto('https://www.figma.com/login', { waitUntil: 'domcontentloaded' });
    await pg.waitForFunction(() => window.__figmaZhHook && window.__figmaZhHook.stats.files.length > 0, null, { timeout: 30000 });
    await pg.waitForTimeout(6000);
    const text = await pg.evaluate(() => document.body.innerText.slice(0, 40).replace(/\n/g, ' / '));
    // 裁掉页头那一条（含对方网站的 logo），只保留被翻译的表单区域
    await pg.screenshot({ path: path.join(OUT, 'screenshot-1-login-1280x800.png'), clip: { x: 0, y: LOGIN_CROP_TOP, width: 1280, height: 800 } });
    console.log('✓ screenshot-1-login-1280x800.png 1280x800  页面文字：' + text);
  } finally {
    await ctx.close();
    fs.rmSync(profile, { recursive: true, force: true });
  }
})().catch(e => { console.error('✗', e.message.split('\n')[0]); process.exit(1); });
