# 微信公众号HTML插件

一个功能强大的Chrome扩展插件，专为微信公众号编辑器设计，支持插入自定义HTML代码、SVG图片和丰富的模板库。

## ✨ 功能特色

### 🎯 核心功能
- **HTML代码插入**: 在微信公众号编辑器中直接插入HTML代码
- **实时预览**: 边写边看，所见即所得的编辑体验
- **兼容性转换**: 自动将HTML代码转换为微信公众号兼容格式
- **SVG支持**: 完整支持SVG图片的插入和显示
- **模板库**: 内置丰富的HTML模板，一键使用

### 🛠️ 高级特性
- **智能检测**: 自动检测微信公众号编辑页面
- **光标定位**: 支持在光标位置或文章末尾插入内容
- **样式内联**: 自动将CSS样式转换为内联样式
- **响应式设计**: 支持各种屏幕尺寸的设备

## 📁 项目结构

```
wexin-plugin/
├── manifest.json          # 扩展配置文件
├── src/                   # 源代码目录
│   ├── background.js      # 后台脚本
│   ├── content.js         # 内容脚本
│   ├── content.css        # 内容脚本样式
│   ├── popup.html         # 弹窗页面
│   ├── popup.css          # 弹窗样式
│   ├── popup.js           # 弹窗脚本
│   └── editor.html        # HTML编辑器页面
├── icons/                 # 图标文件
│   ├── icon16.png
│   ├── icon32.png
│   ├── icon48.png
│   └── icon128.png
├── docs/                  # 文档目录
└── README.md              # 项目说明
```

## 🚀 安装方式

### 方式一：开发者模式安装（推荐）

1. **下载源码**
   ```bash
   git clone https://github.com/ieasydevops/wexin-plugin.git
   cd wexin-plugin
   ```

2. **打开Chrome扩展管理页面**
   - 在Chrome地址栏输入 `chrome://extensions/`
   - 或者：菜单 → 更多工具 → 扩展程序

3. **启用开发者模式**
   - 在页面右上角打开"开发者模式"开关

4. **加载扩展**
   - 点击"加载已解压的扩展程序"
   - 选择项目根目录（包含manifest.json的文件夹）

5. **完成安装**
   - 扩展安装成功后会在工具栏显示插件图标

### 方式二：打包安装

1. 在扩展管理页面点击"打包扩展程序"
2. 选择项目根目录进行打包
3. 将生成的.crx文件拖拽到扩展管理页面

## 📖 使用指南

### 基础使用

1. **访问微信公众号编辑页面**
   - 登录微信公众平台: https://mp.weixin.qq.com
   - 进入文章编辑页面

2. **插入HTML代码**
   - 方式1：点击编辑器工具栏中的"HTML"按钮
   - 方式2：点击浏览器工具栏中的插件图标

3. **编辑HTML代码**
   - 在代码编辑区域输入HTML代码
   - 右侧实时预览效果
   - 选择插入位置（光标位置/文章末尾）

4. **插入到文章**
   - 点击"插入HTML"按钮
   - 代码会自动插入到编辑器中

### 高级功能

#### 🎨 使用模板库

1. 在插件弹窗或编辑器中切换到"模板库"标签
2. 浏览可用的HTML模板
3. 点击"使用"按钮应用模板
4. 根据需要修改模板内容

#### 🖼️ 插入SVG图片

1. 切换到"SVG工具"标签
2. 上传SVG文件或直接粘贴SVG代码
3. 在预览区域查看效果
4. 点击插入到文章中

#### ⚙️ 兼容性设置

- **自动转换**: 开启后会自动将HTML转换为微信兼容格式
- **SVG支持**: 启用SVG图片的插入功能
- **插入位置**: 选择在光标位置或文章末尾插入

## 🎨 内置模板

插件内置了多种实用的HTML模板：

### 基础模板
- **简单文本框**: 带边框的内容容器
- **标题块**: 突出显示的标题样式
- **引用块**: 优雅的引用文本样式

### 高级模板
- **渐变背景框**: 吸引眼球的渐变背景
- **按钮样式**: 各种风格的按钮元素
- **信息卡片**: 结构化的信息展示卡片

### 自定义模板
- 支持保存自定义模板
- 可以导入/导出模板配置
- 模板管理和分类功能

## 🔧 技术架构

### 核心技术栈
- **Manifest V3**: Chrome扩展最新规范
- **Vanilla JavaScript**: 原生JS，无依赖
- **CSS3**: 现代CSS特性
- **HTML5**: 语义化HTML结构

### 主要模块

#### Background Script (后台脚本)
- 扩展生命周期管理
- 消息路由和通信
- 存储管理
- HTML兼容性处理

#### Content Script (内容脚本)
- 页面注入和DOM操作
- 编辑器检测和按钮注入
- 模态框管理
- 用户交互处理

#### Popup (弹窗页面)
- 快捷操作界面
- 设置管理
- 状态显示
- 模板快速访问

## 🛡️ 兼容性处理

### 微信公众号限制
微信公众号编辑器对HTML有严格限制，插件会自动处理：

- **样式内联化**: 将CSS类转换为内联样式
- **标签白名单**: 移除不支持的HTML标签
- **属性过滤**: 清理不允许的属性
- **脚本移除**: 自动移除JavaScript代码

### 支持的HTML元素
```html
<!-- 文本元素 -->
<p>, <span>, <div>, <h1>-<h6>
<strong>, <em>, <u>, <s>

<!-- 列表元素 -->
<ul>, <ol>, <li>

<!-- 表格元素 -->
<table>, <tr>, <td>, <th>

<!-- 媒体元素 -->
<img>, <svg>

<!-- 其他元素 -->
<a>, <blockquote>, <br>
```

### 支持的CSS样式
```css
/* 文本样式 */
color, font-size, font-weight, text-align, line-height

/* 布局样式 */
margin, padding, border, width, height

/* 背景样式 */
background-color, background-image, background-size

/* 其他样式 */
border-radius, box-shadow, opacity
```

## 🐛 常见问题

### Q: 为什么插件检测不到微信编辑器？
A: 确保你在微信公众号的文章编辑页面，URL应包含 `mp.weixin.qq.com` 和 `appmsg` 或 `draft`。

### Q: 插入的HTML代码显示不正常？
A: 检查是否开启了"自动转换为微信兼容格式"选项，微信对HTML有严格限制。

### Q: SVG图片无法显示？
A: 确保SVG代码格式正确，并且启用了SVG支持选项。

### Q: 模板加载失败？
A: 尝试刷新页面或重新安装插件，检查Chrome存储权限。

## 🤝 贡献指南

欢迎贡献代码、报告问题或提出建议！

### 开发环境设置
1. Fork 项目仓库
2. 克隆到本地: `git clone your-fork-url`
3. 创建功能分支: `git checkout -b feature/new-feature`
4. 提交更改: `git commit -m 'Add new feature'`
5. 推送分支: `git push origin feature/new-feature`
6. 创建Pull Request

### 代码规范
- 使用ES6+语法
- 遵循一致的代码风格
- 添加必要的注释
- 确保跨浏览器兼容性

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 📞 联系我们

- **项目主页**: https://github.com/ieasydevops/wexin-plugin
- **问题反馈**: https://github.com/ieasydevops/wexin-plugin/issues
- **功能建议**: https://github.com/ieasydevops/wexin-plugin/discussions

## 🎉 更新日志

### v1.0.0 (2024-01-15)
- 🎉 首次发布
- ✨ 基础HTML插入功能
- 🎨 内置模板库
- 🖼️ SVG支持
- ⚙️ 兼容性处理
- 📱 响应式设计

---

**如果这个插件对你有帮助，请给我们一个 ⭐️ Star！** 