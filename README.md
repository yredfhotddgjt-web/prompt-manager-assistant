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

## 为什么做它

很多好 Prompt 都散落在网页、社区、文档和聊天记录里。  
提示词管理助手的目标很直接：把这些零散灵感，沉淀成你自己的本地 Prompt 资料库。

## 它解决什么问题

- 看到有价值的 Prompt，不用再手动复制到别的文档
- 保存时尽量拆分标题、正文和图片，后面回看更清晰
- 需要复用时，可以按分类和关键词快速找到并复制

## 它适合谁

- 经常收集 AI 提示词的创作者
- 需要整理灵感素材的设计师和内容团队
- 希望把 Prompt 从“随手收藏”变成“可重复调用资产”的重度用户

## 核心体验

- 侧边栏形态，浏览和整理都在浏览器里完成
- 右键即可保存 Prompt
- 支持分类、搜索、详情查看和一键复制
- 支持图片绑定、本地保存和拖拽导入

## 立即体验

- [打开 Demo Showcase](https://yredfhotddgjt-web.github.io/prompt-manager-assistant/)

如果你准备把这个仓库作为公开展示主页，这个链接就是最适合对外分享的入口。  
仓库首页里的 `立即体验` 按钮会直接跳到这里。

## 下载发布版

- [打开 Latest Release](https://github.com/yredfhotddgjt-web/prompt-manager-assistant/releases/latest)
- [查看当前版本 v0.1.0](https://github.com/yredfhotddgjt-web/prompt-manager-assistant/releases/tag/v0.1.0)

发布包中已经包含：

- 可直接加载的扩展文件
- `安装说明.txt`
- Chrome / Edge 的加载说明

## 本地安装

### Chrome

1. 打开“扩展-管理扩展”
2. 打开右上角“开发者模式”
3. 点击“加载已解压的扩展程序”
4. 选择当前项目下的 `extension` 文件夹

### Edge

1. 打开“扩展-管理扩展”
2. 打开左下角“开发人员模式”
3. 点击“加载解压缩的扩展”
4. 选择当前项目下的 `extension` 文件夹

## 项目结构

```text
docs/         GitHub Pages 演示页
extension/    浏览器扩展主体代码
outputs/      本地导出产物
package/      发布包与安装说明
work/         临时工作文件
```

## 路线图

- 优化更多网页结构下的标题 / 正文识别
- 提升更多站点场景下的图片捕获稳定性
- 准备 Chrome Web Store 与 Microsoft Edge Add-ons 上架版本
- 补充欢迎页、隐私政策和商店素材

## 开源协议

本项目基于 [MIT License](./LICENSE) 开源。
