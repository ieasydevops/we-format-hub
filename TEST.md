# 🧪 微信HTML插件测试指南

## 🚀 修复说明

已修复的主要问题：
1. ✅ **函数作用域问题** - 将 `convertHtmlForWeChat` 函数移至注入函数内部
2. ✅ **manifest.json错误** - 移除了不存在的资源引用
3. ✅ **错误处理改进** - 添加了更详细的调试信息和错误处理
4. ✅ **编辑器检测增强** - 扩展了工具栏和编辑器的选择器范围
5. ✅ **扩展上下文失效** - 修复"Extension context invalidated"错误
6. ✅ **HTML格式验证** - 自动检测和处理完整HTML文档格式
7. ✅ **用户体验提升** - 添加格式说明和错误提示优化

## 📋 测试步骤

### 第一步：重新加载扩展
1. 打开Chrome扩展管理页面：`chrome://extensions/`
2. 找到"微信公众号HTML插件"
3. 点击"重新加载"按钮 🔄
4. 确保扩展状态为"已启用"

### 第二步：验证扩展加载
在扩展管理页面检查：
- ✅ 扩展图标正常显示
- ✅ 没有错误提示
- ✅ 版本显示为1.0.0

### 第三步：测试微信编辑页面
1. 访问微信公众平台：`https://mp.weixin.qq.com`
2. 进入文章编辑页面（新建文章或编辑草稿）
3. 等待页面完全加载（约3-5秒）

### 第四步：检查HTML按钮
在微信编辑页面：
- 🔍 查看编辑器工具栏是否出现"HTML"按钮
- 📍 按钮应该显示在工具栏中，带有HTML图标和文字

### 第五步：运行调试脚本
1. 在微信编辑页面按 `F12` 打开开发者工具
2. 切换到 `Console` 标签
3. 将 `debug.js` 文件内容复制粘贴到控制台
4. 按回车执行
5. 查看调试输出

### 第六步：测试HTML插入功能
1. 点击"HTML"按钮
2. 在弹出的对话框中输入测试HTML：
   ```html
   <div style="padding: 20px; background: #f0f8ff; border: 2px solid #007cff; border-radius: 8px;">
     <h3 style="color: #007cff; margin: 0 0 10px 0;">测试标题</h3>
     <p style="margin: 0; color: #333;">这是一个HTML测试内容，用于验证插件功能。</p>
   </div>
   ```
3. 点击"插入HTML"按钮
4. 检查内容是否正确插入到编辑器中

## 🔧 故障排除

### 问题1：扩展显示"chrome-extension://invalid/"
**解决方案：**
- 卸载并重新安装扩展
- 确保所有图标文件存在于 `icons/` 目录
- 检查 `manifest.json` 语法

### 问题2：HTML按钮不显示
**解决方案：**
1. 运行调试脚本检查工具栏检测
2. 手动刷新页面
3. 检查控制台是否有错误信息

### 问题3：点击HTML按钮无反应  
**解决方案：**
1. 检查控制台错误信息
2. 确保在正确的微信编辑页面（URL包含appmsg）
3. 尝试禁用其他Chrome扩展

### 问题4：HTML插入失败
**解决方案：**
1. 检查控制台的错误信息
2. 验证HTML代码格式正确
3. 尝试插入简单的HTML代码

## 📊 调试信息检查清单

运行调试脚本后，确保以下项目都是 ✅：

- [ ] **扩展状态**: Chrome扩展API可用
- [ ] **页面匹配**: 在微信公众号编辑页面  
- [ ] **内容脚本**: 已注入
- [ ] **HTML按钮**: 存在
- [ ] **编辑器**: 找到
- [ ] **工具栏**: 找到
- [ ] **通信**: 正常

## 🎯 成功指标

插件正常工作的标志：
1. ✅ HTML按钮显示在微信编辑器工具栏
2. ✅ 点击按钮弹出HTML编辑对话框
3. ✅ 输入HTML代码后能看到实时预览
4. ✅ 点击插入后HTML正确添加到文章中
5. ✅ 控制台显示"✅ HTML代码插入成功"通知

## 💡 测试用例

### 基础HTML测试
```html
<p style="color: red; font-weight: bold;">红色粗体文字</p>
```

### 复杂布局测试  
```html
<div style="display: flex; gap: 10px; margin: 20px 0;">
  <div style="flex: 1; padding: 15px; background: #e8f4f8; border-radius: 5px;">
    <h4 style="margin: 0 0 8px 0; color: #2c5282;">左侧内容</h4>
    <p style="margin: 0; color: #666;">这里是左侧文字</p>
  </div>
  <div style="flex: 1; padding: 15px; background: #f7fafc; border-radius: 5px;">
    <h4 style="margin: 0 0 8px 0; color: #2c5282;">右侧内容</h4>
    <p style="margin: 0; color: #666;">这里是右侧文字</p>
  </div>
</div>
```

### SVG图标测试
```html
<svg width="24" height="24" viewBox="0 0 24 24" style="vertical-align: middle;">
  <circle cx="12" cy="12" r="10" fill="#4CAF50"/>
  <path d="M9 12l2 2 4-4" stroke="white" stroke-width="2" fill="none"/>
</svg>
<span style="margin-left: 8px;">带图标的文字</span>
```

如果所有测试通过，说明插件已经成功修复并可以正常使用！🎉 