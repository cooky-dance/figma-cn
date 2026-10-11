# Figma 简体中文术语表与翻译规范

## 规范
1. 输出简体中文，面向设计师的专业软件界面语气：简洁、准确，用"你"而不是"您"。
2. **占位符原样保留**：`{name}`、`{count}`、`{appName}` 等花括号内的变量名一个字符都不能改，也不能删除或新增。
3. **ICU 语法**：`{count, plural, one {...} other {...}}`、`{x, select, a {...} other {...}}` 结构必须保留；只翻译最内层的自然语言文本。关键字 `plural`/`select`/`selectordinal`/`one`/`other`/`=0`/`=1` 及分支名不翻译。`#` 号保留。中文无单复数之分，可让 one/other 分支译文相同，但分支必须都保留。
4. 富文本标签如 `<b>…</b>`、`<link>…</link>` 原样保留标签，翻译中间文字。
5. 品牌和产品名不翻译：Figma、FigJam、Figma Slides、Figma Sites、Figma Make、Figma Buzz、Figma Draw、Dev Mode 的英文品牌除外（Dev Mode 译"开发模式"）、Code Connect、Figma AI、GitHub、Slack、Jira、VS Code、MCP、API、URL、SSO、SAML、SCIM、CSS、SVG、PNG、JPG、PDF、iOS、Android、Tailwind、React。
6. 中英文、中文与数字之间加一个半角空格（如"复制 CSS 代码"、"共 {count} 个"）；中文句子使用全角标点（，。：；？！“”），省略号用"…"。
7. 快捷键、单位、代码片段、CSS 属性名、颜色值保持英文。
8. 纯技术字符串（只有变量、符号、URL、单词缩写）可以原样返回。
9. 不要意译出原文没有的信息，不要省略原文信息。

## 核心术语（必须统一）
| English | 中文 |
|---|---|
| Frame | 画框 |
| Group | 分组 |
| Section | 分区 |
| Component | 组件 |
| Main component | 组件母版 |
| Instance | 实例（组件实例） |
| Variant / Variants | 变体 |
| Component property | 组件属性 |
| Slot | 插槽 |
| Auto layout | 自动布局 |
| Layer(s) | 图层 |
| Page(s) | 页面 |
| Assets | 资源 |
| Library / Libraries | 组件库 |
| Style(s) | 样式 |
| Variable(s) | 变量 |
| Collection | 集合 |
| Mode (variable mode) | 模式 |
| Token | 令牌 |
| Prototype | 原型 |
| Interaction | 交互 |
| Overlay | 叠加层 |
| Smart animate | 智能动画 |
| Flow | 流程 |
| Starting point | 起始点 |
| Design (tab) | 设计 |
| Dev Mode | 开发模式 |
| Inspect | 检查 |
| Annotation | 标注 |
| Measurement | 测量 |
| Plugin(s) | 插件 |
| Widget(s) | 小部件 |
| Fill | 填充 |
| Stroke | 描边 |
| Effect(s) | 效果 |
| Drop shadow / Inner shadow | 投影 / 内阴影 |
| Layer blur / Background blur | 图层模糊 / 背景模糊 |
| Export | 导出 |
| Constraints | 约束 |
| Layout grid | 布局网格 |
| Selection colors | 所选颜色 |
| Text | 文本 |
| Typography | 排版 |
| Opacity | 不透明度 |
| Blend mode | 混合模式 |
| Pass through | 穿透 |
| Corner radius | 圆角半径 |
| Clip content | 裁剪内容 |
| Hug contents | 适应内容 |
| Fill container | 填充容器 |
| Fixed | 固定 |
| Padding | 内边距 |
| Gap / Spacing | 间距 |
| Alignment | 对齐 |
| Mask | 蒙版 |
| Boolean groups | 布尔组 |
| Union / Subtract / Intersect / Exclude | 联集 / 减去顶层 / 交集 / 差集 |
| Flatten | 拼合 |
| Outline stroke | 轮廓化描边 |
| Pen / Pencil | 钢笔 / 铅笔 |
| Hand tool | 抓手工具 |
| Move / Scale | 移动 / 缩放 |
| Rectangle / Ellipse / Line / Arrow / Polygon / Star | 矩形 / 椭圆 / 直线 / 箭头 / 多边形 / 星形 |
| Image / Vector | 图片 / 矢量 |
| Canvas | 画布 |
| Ruler(s) / Guide(s) / Grid | 标尺 / 参考线 / 网格 |
| Zoom | 缩放 |
| Team / Project / Drafts | 团队 / 项目 / 草稿 |
| Workspace | 工作区 |
| File browser | 文件浏览器 |
| Organization / Enterprise / Professional / Starter / Education | 组织版 / 企业版 / 专业版 / 入门版 / 教育版（指套餐时） |
| Plan | 套餐 |
| Seat | 席位 |
| Full seat / Dev seat / Collab seat / View seat | 全席位 / 开发席位 / 协作席位 / 查看席位 |
| Owner / Admin / Editor / Viewer / Member / Guest | 所有者 / 管理员 / 编辑者 / 查看者 / 成员 / 访客 |
| Can edit / Can view | 可编辑 / 可查看 |
| Comment(s) | 评论 |
| Share | 分享 |
| Present | 演示 |
| Branch / Merge | 分支 / 合并 |
| Version history | 版本历史 |
| Publish / Unpublish | 发布 / 取消发布 |
| Detach instance | 分离实例 |
| Swap instance | 交换实例 |
| Reset | 重置 |
| Community | 社区 |
| Credits (AI credits) | 点数（AI 点数） |
| Billing | 账单 |
| Settings / Preferences | 设置 / 偏好设置 |
| Upgrade | 升级 |
| Learn more | 了解详情 |
| Undo / Redo | 撤销 / 重做 |
| Duplicate | 创建副本 |
| Rename | 重命名 |
| Delete | 删除 |
| Copy / Paste / Cut | 复制 / 粘贴 / 剪切 |
| Dismiss | 关闭 |
| Got it | 知道了 |
| Untitled | 未命名 |
| Sticky / Sticky note | 便签 |
| Connector | 连接线 |
| Stamp | 印章 |
| Slide(s) | 幻灯片 |
| Template(s) | 模板 |
| Workshop | 工作坊 |
| Site(s) | 网站 |
| Breakpoint | 断点 |
| Make (Figma Make) | Figma Make（不译） |
| Prompt | 提示词 |
