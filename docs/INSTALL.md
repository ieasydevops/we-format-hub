# 微信公众号HTML插件 - 安装指南

## 📦 安装步骤

### 前置要求
- Chrome 浏览器 (版本 88 或更高)
- 微信公众号账号和编辑权限

### 方法一：开发者模式安装 (推荐)

1. **下载插件源码**
   ```bash
   git clone https://github.com/ieasydevops/wexin-plugin.git
   ```
   或直接下载ZIP文件并解压

2. **打开Chrome扩展管理页面**
   - 在地址栏输入: `chrome://extensions/`
   - 或点击 Chrome菜单 → 更多工具 → 扩展程序

3. **启用开发者模式**
   - 在页面右上角切换"开发者模式"开关为开启状态

4. **加载插件**
   - 点击"加载已解压的扩展程序"按钮
   - 选择项目根目录 (包含 `manifest.json` 的文件夹)
   - 点击"选择文件夹"

5. **验证安装**
   - 插件成功安装后，会在扩展列表中显示
   - Chrome工具栏会出现插件图标

### 方法二：打包安装

1. **打包扩展**
   - 在扩展管理页面，确保开发者模式已开启
   - 点击"打包扩展程序"
   - 选择项目根目录
   - 生成 `.crx` 和 `.pem` 文件

2. **安装打包文件**
   - 将 `.crx` 文件拖拽到扩展管理页面
   - 确认安装

## 🎯 首次使用

### 1. 访问微信公众号后台
```
https://mp.weixin.qq.com
```

### 2. 进入文章编辑页面
- 登录微信公众号后台
- 点击"新建图文消息"或编辑现有文章
- 确保URL包含 `appmsg` 或 `draft`

### 3. 查看插件状态
- 点击浏览器工具栏中的插件图标
- 确认状态显示为"检测到微信公众号编辑页面"
- 如果显示为红色，请检查是否在正确的页面

### 4. 插入HTML代码
**方法一：使用工具栏按钮**
- 在微信编辑器工具栏中找到紫色的"HTML"按钮
- 点击按钮打开HTML编辑模态框

**方法二：使用插件弹窗**
- 点击浏览器工具栏中的插件图标
- 点击"打开HTML编辑器"或"快速插入模板"

## ⚙️ 功能配置

### 自动转换设置
- **启用**: HTML代码会自动转换为微信兼容格式
- **禁用**: 保持原始HTML代码不变

### SVG支持
- **启用**: 允许插入和处理SVG图片
- **禁用**: 过滤掉SVG相关代码

### 插入位置选择
- **光标位置**: 在当前光标位置插入HTML
- **文章末尾**: 在文章最后插入HTML

## 🔧 高级配置

### 自定义模板
1. 在HTML编辑器中编写模板代码
2. 保存为自定义模板 (功能开发中)
3. 在模板库中使用

### 键盘快捷键
- `Ctrl + S`: 保存HTML文件
- `Ctrl + N`: 新建HTML文件
- `Ctrl + O`: 打开HTML文件
- `F11`: 全屏模式

### 导入/导出
- **导出**: 将HTML代码保存为 `.html` 文件
- **导入**: 从本地文件加载HTML代码

## 🐛 故障排除

### 插件无法加载
1. 确认Chrome版本 ≥ 88
2. 检查扩展是否已启用
3. 尝试重新加载扩展
4. 重启Chrome浏览器

### 检测不到微信编辑器
1. 确认URL包含 `mp.weixin.qq.com`
2. 确认在文章编辑页面 (包含 `appmsg` 或 `draft`)
3. 刷新页面后重试
4. 检查是否有其他扩展冲突

### HTML代码显示异常
1. 检查是否启用"自动转换"
2. 验证HTML语法是否正确
3. 确认使用微信支持的HTML标签
4. 检查CSS样式是否内联

### 模板加载失败
1. 检查网络连接
2. 清除浏览器缓存
3. 重新安装插件
4. 检查Chrome存储权限

### SVG图片不显示
1. 确认SVG代码格式正确
2. 检查是否启用SVG支持
3. 验证SVG文件是否有效
4. 尝试内联SVG代码

## 📱 兼容性说明

### 支持的浏览器
- ✅ Chrome 88+
- ✅ Microsoft Edge 88+
- ❌ Firefox (不支持)
- ❌ Safari (不支持)

### 支持的微信功能
- ✅ 图文消息编辑
- ✅ 草稿箱编辑
- ✅ 素材库管理
- ❌ 小程序页面 (不支持)

### HTML标签支持
```html
<!-- 支持的标签 -->
<p>, <div>, <span>, <h1>-<h6>
<strong>, <em>, <u>, <s>
<ul>, <ol>, <li>
<table>, <tr>, <td>, <th>
<img>, <svg>, <a>
<blockquote>, <br>

<!-- 不支持的标签 -->
<script>, <style>, <link>
<form>, <input>, <button>
<iframe>, <object>, <embed>
```

### CSS样式支持
```css
/* 支持的样式 */
color, background-color
font-size, font-weight, font-style
text-align, line-height
margin, padding, border
width, height, border-radius

/* 不支持的样式 */
position, float, display: flex
transform, animation
box-shadow (有限支持)
```

## 📞 技术支持

### 获取帮助
- [GitHub Issues](https://github.com/ieasydevops/wexin-plugin/issues)
- [使用文档](https://github.com/ieasydevops/wexin-plugin/wiki)
- [常见问题](https://github.com/ieasydevops/wexin-plugin/wiki/FAQ)

### 反馈渠道
- 🐛 Bug报告: [提交Issue](https://github.com/ieasydevops/wexin-plugin/issues/new?template=bug_report.md)
- 💡 功能建议: [功能请求](https://github.com/ieasydevops/wexin-plugin/issues/new?template=feature_request.md)
- 📧 邮件联系: support@ieasydevops.com

### 更新说明
插件会自动检查更新，也可以手动更新：
1. 访问 [GitHub Releases](https://github.com/ieasydevops/wexin-plugin/releases)
2. 下载最新版本
3. 重新安装插件

---

**如果安装过程中遇到问题，请参考[故障排除](#-故障排除)部分或提交Issue获取帮助。** 