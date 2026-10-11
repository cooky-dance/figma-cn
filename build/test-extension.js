// 把 dist/figma-zh-extension 当作真正的扩展加载进浏览器，打开 figma.com 登录页验证是否显示中文。
// 使用全新的临时用户目录，不接触任何现有浏览器配置。
// 用法：node build/test-extension.js [msedge|chrome]
const path = require('path');
const fs = require('fs');
const os = require('os');
const { chromium } = require('playwright-core');

const channel = process.argv[2] || 'msedge';
const ext = path.resolve(process.env.FIGMA_ZH_EXT || path.join(__dirname, '..', 'dist', 'figma-zh-extension'));
const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'figma-zh-test-'));

(async () => {
  const ctx = await chromium.launchPersistentContext(profile, {
    channel,
    headless: false,
    args: ['--headless=new', `--disable-extensions-except=${ext}`, `--load-extension=${ext}`, '--no-first-run', '--no-default-browser-check'],
  });
  try {
    const page = ctx.pages()[0] || await ctx.newPage();
    const logs = [];
    page.on('console', m => { if (/figma-zh/.test(m.text())) logs.push(m.text()); });
    await page.goto('https://www.figma.com/login', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(8000);
    const info = await page.evaluate(() => ({
      pageScript: !!window.__figmaZhPage,
      hook: !!window.__figmaZhHook,
      dictLeaked: typeof self.__FIGMA_ZH_DICT__,
      stats: window.__figmaZhHook ? window.__figmaZhHook.stats.files : null,
      text: document.body.innerText.slice(0, 300),
    }));
    console.log(JSON.stringify({ channel, version: ctx.browser() && ctx.browser().version(), ...info, logs }, null, 1));
  } finally {
    await ctx.close();
    fs.rmSync(profile, { recursive: true, force: true });
  }
})().catch(e => { console.error('TEST ERROR', e.message.split('\n')[0]); process.exit(1); });
