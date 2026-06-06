# 提示词管理助手

一个基于 Manifest V3 的侧边栏扩展，用来本地保存、分类、搜索和快速复制 Prompt，可用于 Chrome 和 Edge 等 Chromium 浏览器。

## 当前能力

- 侧边栏形态，点击扩展图标即可打开
- 默认展示 Prompt 列表
- 支持自定义分类和分类筛选
- 支持新增、编辑、删除 Prompt
- 支持给 Prompt 绑定截图，并以原图本地保存
- 支持把图片文件直接拖进截图区域
- 支持搜索标题、分类和内容
- 支持直接从列表卡片复制 Prompt
- 支持在网页里选中文本后右键，一键添加到侧边栏
- 支持对整块选区做基础结构识别：优先把标题识别为标题、正文识别为 Prompt 内容、选区内图片识别为截图

## 通用捕获建议

- 最稳的方式：从标题第一行开始，拖选到 Prompt 正文和图片附近，然后右键选择“保存为 Prompt”。
- 如果网站结构导致图片没有自动带入，保持侧边栏里的草稿不关闭，再右键目标图片选择“保存为 Prompt”，图片会追加到当前草稿。
- 对懒加载、跨域或特殊图片地址，扩展会尝试用当前可见页截图裁剪作为兜底截图。
- 支持常见 `<img>`、图片链接、CSS `background-image`、`picture/source`、`canvas`、`svg`、`role="img"` 视觉块，以及选区可见区域截图兜底。
- 本地测试页：`work/universal-capture-test.html`，可用于验证标题、正文、图片、徽章过滤、背景图、`picture/source`、`canvas` 和通用视觉容器。
- 如需在本地 `file://` 页面测试，请在浏览器扩展详情页打开“允许访问文件网址”。

## 本地安装

### Chrome

1. 打开 `chrome://extensions`
2. 打开右上角“开发者模式”
3. 点击“加载已解压的扩展程序”
4. 选择当前目录下的 `extension` 文件夹

### Edge

1. 打开 `edge://extensions`
2. 打开左下角“开发人员模式”
3. 点击“加载解压缩的扩展”
4. 选择当前目录下的 `extension` 文件夹

## 目录

- `extension/manifest.json`: 扩展清单
- `extension/background.js`: 侧边栏行为入口
- `extension/sidepanel.html`: 侧边栏页面
- `extension/sidepanel.js`: 页面交互逻辑
- `extension/lib/db.js`: IndexedDB 数据层
- `extension/styles/sidepanel.css`: 样式
