# 提示词管理助手 文件包

这个目录是给 GitHub 仓库访问者准备的可下载文件包，包含：

- `prompt-manager-assistant-extension/`
  Chrome / Edge 可加载的扩展文件
- `prompt-manager-assistant-extension.zip`
  同样内容的压缩包，方便直接下载

## 安装方法

### Chrome

1. 下载并解压 `prompt-manager-assistant-extension.zip`
2. 打开 `chrome://extensions`
3. 打开右上角“开发者模式”
4. 点击“加载已解压的扩展程序”
5. 选择解压后的 `prompt-manager-assistant-extension` 文件夹

### Edge

1. 下载并解压 `prompt-manager-assistant-extension.zip`
2. 打开 `edge://extensions`
3. 打开左下角“开发人员模式”
4. 点击“加载解压缩的扩展”
5. 选择解压后的 `prompt-manager-assistant-extension` 文件夹

## 包内说明

- `manifest.json`：扩展清单
- `sidepanel.html` / `sidepanel.js`：侧边栏界面与交互
- `background.js`：右键菜单与后台逻辑
- `content-script.js`：网页内容采集逻辑
- `icons/`：图标资源
- `styles/`：样式文件
- `lib/`：本地数据相关模块

## 推荐入口

- 仓库主页：了解产品介绍与源码说明
- Demo Showcase：查看效果演示
- 这个文件包：直接拿去安装测试
