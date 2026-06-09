# 提示词管理助手项目进度

最后更新：2026-06-10

## 当前项目状态

项目已经完成可用的 Chrome / Edge 侧边栏扩展版本，并已同步完成仓库公开、GitHub Pages 展示页、`v0.1.0` Release 下载包和基础安装说明。

当前主线能力包括：

- Prompt 本地存储、分类、搜索、复制和编辑
- 默认列表页展示，卡片可滚动浏览且不被压缩
- Prompt 详情页查看与截图放大
- 图片拖拽导入和本地保存
- 网页选中文本后右键保存为 Prompt
- 图片右键导入截图
- 标题、正文、图片的基础自动拆分与识别
- Chrome 与 Edge 的本地加载使用

## 已完成阶段

### 1. 核心产品能力

- 完成 Manifest V3 侧边栏扩展基础架构
- 完成 Prompt 列表页、详情页、编辑页
- 完成自定义分类、搜索过滤、复制复用
- 完成截图绑定、移除和放大查看

### 2. 网页采集能力

- 接入文本右键保存流程
- 接入图片右键保存流程
- 支持拖拽图片进入截图区域
- 对连续采集和草稿合并逻辑做过多轮优化
- 收紧识别规则，避免“只选中文本时误带图片”

### 3. 兼容与分发

- 产品名统一为“提示词管理助手”
- 完成 Edge 兼容包整理
- 完成 Release 下载包结构整理
- 安装说明调整为更适合普通用户的文案
- GitHub 仓库公开并采用 MIT 协议

### 4. 展示与宣传素材

- 完成 README 产品化改版
- 完成 GitHub Pages 演示页
- 接入产品海报、Demo 视频和跳转按钮
- 完成首版抖音文案、配音稿、发布建议和朋友圈文案

## 今天同步内容（2026-06-10）

- 修复侧边栏首次打开时偶发的初始化失败问题
- 解决 `pendingSelectionDraft` 为空或结构不完整时触发的异常
- 修复“必须新增一次内容后，之前保存的 Prompt 才显示出来”的问题
- 补充项目进度文档，统一仓库内记录口径

## 当前可访问入口

- GitHub 仓库：<https://github.com/yredfhotddgjt-web/prompt-manager-assistant>
- GitHub Pages：<https://yredfhotddgjt-web.github.io/prompt-manager-assistant/>
- Latest Release：<https://github.com/yredfhotddgjt-web/prompt-manager-assistant/releases/latest>

## 下一步建议

- 继续优化更多网页结构下的标题、正文、图片识别稳定性
- 准备商店上架所需的欢迎页、隐私政策和宣传图
- 视情况规划 `v0.1.1`，把近期稳定性修复归档成下一个小版本
