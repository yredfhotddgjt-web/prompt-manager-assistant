# 提示词管理助手

<p align="center">
  <img src="./docs/assets/poster-generated.png" alt="提示词管理助手海报" width="100%" />
</p>

<h1 align="center">把网页里的好 Prompt，一键收进你的提示词库</h1>

<p align="center">
  一个面向 Chrome / Edge 的侧边栏扩展，用来保存、分类、搜索、查看和快速复用 Prompt。
</p>

<p align="center">
  <a href="https://yredfhotddgjt-web.github.io/prompt-manager-assistant/">
    <img src="https://img.shields.io/badge/立即体验-Demo_Showcase-6A5CFF?style=for-the-badge&logo=googlechrome&logoColor=white" alt="立即体验" />
  </a>
  <a href="https://github.com/yredfhotddgjt-web/prompt-manager-assistant/releases/latest">
    <img src="https://img.shields.io/badge/下载发布版-Latest_Release-1FAD83?style=for-the-badge&logo=files&logoColor=white" alt="下载发布版" />
  </a>
  <a href="./extension">
    <img src="https://img.shields.io/badge/查看源码-Extension_Source-F28C38?style=for-the-badge&logo=github&logoColor=white" alt="查看源码" />
  </a>
  <a href="./LICENSE">
    <img src="https://img.shields.io/badge/开源协议-MIT-1FAD83?style=for-the-badge" alt="开源协议" />
  </a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Side%20Panel-MV3-111827?style=flat-square" alt="Side Panel" />
  <img src="https://img.shields.io/badge/Storage-Local%20Sync-111827?style=flat-square" alt="Local Sync" />
  <img src="https://img.shields.io/badge/Workflow-Right%20Click%20Save-111827?style=flat-square" alt="Right Click Save" />
  <img src="https://img.shields.io/badge/Feature-Search%20%26%20Categories-111827?style=flat-square" alt="Search and Categories" />
</p>

## 项目简介

提示词管理助手的目标很简单：  
把散落在网页、社区、文档和灵感页面里的 Prompt，沉淀成你自己的本地提示词资料库。

它更适合这些真实场景：

- 浏览网页时，直接选中文本并右键保存 Prompt
- 给 Prompt 绑定截图或参考图，方便后续复用
- 按分类和关键词管理大量提示词
- 在需要创作时，快速搜索、查看并一键复制已有 Prompt

## 核心体验

- 侧边栏形态，打开浏览器即可随时查看 Prompt 库
- 默认展示 Prompt 列表，支持滚动浏览和卡片详情
- 支持自定义分类、分类筛选和关键词搜索
- 支持新增、编辑、删除 Prompt
- 支持列表页直接复制，也支持详情页查看完整内容
- 支持给 Prompt 绑定图片，并保留原图
- 支持拖拽图片导入截图区
- 支持网页内选中文本后右键，一键保存为 Prompt
- 支持基础结构识别：优先拆分标题、正文，并在明确选中图片时一并导入

## Demo

在线演示页：

- [打开 Demo Showcase](https://yredfhotddgjt-web.github.io/prompt-manager-assistant/)

如果你准备把这个仓库作为公开展示主页，这个链接会是最适合对外分享的入口。  
仓库首页里的 `立即体验` 按钮会直接跳到这里。

## 文件包

如果你想直接下载扩展并本地安装，建议使用 Releases 里的正式发布包：

- [打开 Latest Release](https://github.com/yredfhotddgjt-web/prompt-manager-assistant/releases/latest)
- [查看当前版本 v0.1.0](https://github.com/yredfhotddgjt-web/prompt-manager-assistant/releases/tag/v0.1.0)

发布包中已经包含：

- 可直接加载的扩展文件
- `安装说明.txt`
- Chrome / Edge 的加载说明

## 安装方式

### Chrome

1. 打开 `chrome://extensions`
2. 打开右上角“开发者模式”
3. 点击“加载已解压的扩展程序”
4. 选择当前项目下的 `extension` 文件夹

### Edge

1. 打开 `edge://extensions`
2. 打开左下角“开发人员模式”
3. 点击“加载解压缩的扩展”
4. 选择当前项目下的 `extension` 文件夹

## 项目结构

```text
docs/         GitHub Pages 演示页
extension/    浏览器扩展主体代码
outputs/      本地导出产物
work/         临时工作文件
```

扩展主目录：

```text
extension/
  background.js
  content-script.js
  manifest.json
  sidepanel.html
  sidepanel.js
  icons/
  lib/
  styles/
```

## 开发说明

- 扩展基于 Manifest V3
- 数据默认保存在本地
- 仓库忽略了 `outputs/` 和 `work/`，这两个目录主要用于本地打包和制作素材
- `docs/` 目录用于 GitHub Pages 展示页，适合做对外演示和产品介绍

## 路线图

- 优化更多网页结构下的标题 / 正文识别
- 提升更多站点场景下的图片捕获稳定性
- 准备 Chrome Web Store 与 Microsoft Edge Add-ons 上架版本
- 补充欢迎页、隐私政策和商店素材

## 开源协议

本项目基于 [MIT License](./LICENSE) 开源。
