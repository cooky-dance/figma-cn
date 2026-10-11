# figma-cn

Figma 网页版的简体中文浏览器扩展（扩展名称：**Figma FullCN**）。只在 `figma.com` 运行，支持 Chrome、Edge、Tabbit 等 Chromium 内核浏览器（Manifest V3，Chromium 111+）。

> 非 Figma 官方项目，与 Figma, Inc. 无关联。Figma 是 Figma, Inc. 的商标。

## 特点

- **由 Figma 自己渲染中文**。Figma 网页按词条 key 加载官方英文词典，本扩展在加载那一刻把每个 key 的文字换成中文，而不是事后在页面上查找替换文本。所以占位符、单复数都正确，也不会误改你的图层名和文件内容。
- **覆盖 32,847 个词条**：编辑器、文件浏览器、原型播放、登录页、管理后台。
- **不会因 Figma 更新而出错**。Figma 新增的词条没有译文时保持英文显示。
- **只在 figma.com 生效**，只申请 `storage` 权限，不联网、不收集任何数据。

## 安装

1. 打开 [Releases 页面](https://github.com/cooky-dance/figma-cn/releases/latest)，下载 `figma-fullcn-x.y.z.zip` 并解压到一个固定的文件夹（安装后不要删除或移动它）。
2. 打开浏览器的扩展管理页：
   - Chrome / Tabbit：`chrome://extensions`
   - Edge：`edge://extensions`
3. 打开 **开发者模式**。
4. 点 **加载已解压的扩展程序**，选择刚才解压出来的文件夹（里面直接能看到 `manifest.json`）。
5. 刷新 figma.com。

Figma 账户设置里的语言请保持 **English**。本扩展替换的是英文词典，选择日语等其他语言时不生效。

**更新版本**：下载新的 zip，解压覆盖到原来的文件夹，在扩展管理页点这个扩展卡片上的「重新加载」，再刷新 figma.com。只刷新网页不会生效。

也可以直接使用源码：`git clone` 本仓库后加载 `dist/figma-zh-extension` 文件夹。

**确认是否生效**：在 figma.com 按 F12 打开 Console，看到 `[figma-zh] 已汉化 N / M 条` 即表示词典已替换。

**开关**：点浏览器工具栏上的扩展图标。

| 选项 | 说明 |
|---|---|
| 启用中文界面 | 默认开启 |
| 补充翻译（实验性） | 默认关闭。对少数没有走官方词典的文字做页面文本替换，可能误译与界面词同名的图层名 |

## 想要独立窗口的中文 Figma

装好扩展后，在浏览器里把 figma.com 安装为应用（Edge：菜单 → 应用 → 将此站点作为应用安装；Chrome：菜单 → 保存并分享 → 创建快捷方式 → 勾选"在窗口中打开"）。

Figma 桌面客户端无法汉化：它带有完整性检查，程序文件被修改后会拒绝启动。本项目不提供绕过方法。

## 译文说明

- 约 7,460 个词条的译文来自 [figmaCN](https://github.com/yancymin/figmaCN)（figma.cool 的开源词典，由设计师人工翻译校对）。
- 其余约 25,000 个词条为机器翻译（AI 辅助），按 [`translations/GLOSSARY.md`](translations/GLOSSARY.md) 统一术语，并逐条通过了占位符与 ICU 复数结构的自动校验。**这部分没有逐条人工校对**，可能存在不够自然或不准确的译法。
- 发现问题欢迎提 Issue 或 PR，直接修改 [`translations/web/zh-cn.json`](translations/web/zh-cn.json) 中对应 key 的译文即可。

## 开发

需要 Node.js 18+。

```bash
npm install
npm run build     # 由 translations/web/zh-cn.json 生成 dist/figma-zh-extension
npm test          # 钩子测试 + 把扩展加载进 Edge 临时配置里打开登录页检查
```

校验译文结构（占位符、复数分支、标签是否与原文一致）：

```bash
node translations/validate.js <批次目录> <批次名>
```

### 目录

```
dist/figma-zh-extension/    可直接安装的扩展
extension/                  扩展源码（manifest、弹窗、内容脚本入口）
src/hook.js                 词典钩子：包装 fetch，按 key 替换词典
translations/web/zh-cn.json 词条 key → 中文
translations/shell/         Figma 桌面外壳词条的译文（仅留档，未使用）
translations/GLOSSARY.md    术语表与翻译规范
vendor/figmaCN/             上游 figmaCN 的词典与页面翻译脚本
build/                      构建、测试与词典更新脚本
```

### 跟进 Figma 的新词条

`build/update-source.js` 会下载 Figma 当前的英文词典，找出还没有译文的词条并生成待翻译批次。英文词典是 Figma 的内容，只保存在本地（已在 `.gitignore` 中排除），不随仓库分发。

```bash
npm run update-source                                # 生成 translations/work/pending/bNNN.json
# 按 GLOSSARY.md 翻译为 bNNN.zh.json，并逐批校验
node build/collect.js translations/work/pending      # 合并进本地翻译记忆
npm run build
```

## 工作原理

Figma 网页通过 `<link id="englishDictionaryUrl">` 取得词典地址，再用 `fetch()` 加载 `*.min.en.json`。扩展在 `document_start` 向页面主世界注入脚本，包装 `window.fetch`：遇到词典请求时取回原始响应，把有译文的 key 替换成中文后再交还给页面。

主词典作为内容脚本随钩子一起加载，而不是运行时再去读取扩展内的文件——后者在 Manifest V3 下需要声明 `web_accessible_resources`，漏配时会静默失败。

## 许可

[GPL-3.0](LICENSE)。本项目包含并改编了 [figmaCN](https://github.com/yancymin/figmaCN)（GPL-3.0）的词典与页面翻译脚本。
