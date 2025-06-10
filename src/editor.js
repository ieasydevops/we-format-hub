// HTML编辑器脚本
class HtmlEditor {
  constructor() {
    this.currentFile = null;
    this.isDirty = false;
    this.livePreview = true;
    this.autoConvert = true;
    this.debounceTimer = null;
    
    this.init();
  }

  init() {
    this.initializeElements();
    this.setupEventListeners();
    this.loadSettings();
    this.updatePreview();
  }

  initializeElements() {
    this.htmlEditor = document.getElementById('html-editor');
    this.previewFrame = document.getElementById('preview-frame');
    this.charCount = document.getElementById('char-count');
    this.lineCount = document.getElementById('line-count');
    this.autoConvertCheck = document.getElementById('auto-convert-check');
    this.livePreviewCheck = document.getElementById('live-preview-check');
  }

  setupEventListeners() {
    // 编辑器事件
    this.htmlEditor.addEventListener('input', () => {
      this.onContentChange();
    });

    this.htmlEditor.addEventListener('scroll', () => {
      this.syncScroll();
    });

    // 头部按钮
    document.getElementById('save-btn').addEventListener('click', () => {
      this.saveFile();
    });

    document.getElementById('close-btn').addEventListener('click', () => {
      this.closeEditor();
    });

    // 工具栏按钮
    document.getElementById('new-btn').addEventListener('click', () => {
      this.newFile();
    });

    document.getElementById('open-btn').addEventListener('click', () => {
      document.getElementById('file-input').click();
    });

    document.getElementById('file-input').addEventListener('change', (e) => {
      this.openFile(e.target.files[0]);
    });

    document.getElementById('insert-template-btn').addEventListener('click', () => {
      this.showTemplateModal();
    });

    document.getElementById('insert-svg-btn').addEventListener('click', () => {
      this.showSvgModal();
    });

    // 设置检查框
    this.autoConvertCheck.addEventListener('change', (e) => {
      this.autoConvert = e.target.checked;
      this.saveSettings();
    });

    this.livePreviewCheck.addEventListener('change', (e) => {
      this.livePreview = e.target.checked;
      this.saveSettings();
      if (this.livePreview) {
        this.updatePreview();
      }
    });

    // 面板操作按钮
    document.getElementById('format-btn').addEventListener('click', () => {
      this.formatCode();
    });

    document.getElementById('clear-btn').addEventListener('click', () => {
      this.clearEditor();
    });

    document.getElementById('refresh-preview-btn').addEventListener('click', () => {
      this.updatePreview();
    });

    document.getElementById('fullscreen-btn').addEventListener('click', () => {
      this.toggleFullscreen();
    });

    // 底部按钮
    document.getElementById('insert-to-wechat-btn').addEventListener('click', () => {
      this.insertToWeChat();
    });

    document.getElementById('copy-code-btn').addEventListener('click', () => {
      this.copyCode();
    });

    // 模态框事件
    this.setupModalEvents();

    // 键盘快捷键
    document.addEventListener('keydown', (e) => {
      this.handleKeyboard(e);
    });

    // 页面关闭前确认
    window.addEventListener('beforeunload', (e) => {
      if (this.isDirty) {
        e.preventDefault();
        e.returnValue = '您有未保存的更改，确定要离开吗？';
      }
    });
  }

  setupModalEvents() {
    // 模板模态框
    const templateModal = document.getElementById('template-modal');
    const templateClose = templateModal.querySelector('.modal-close');
    
    templateClose.addEventListener('click', () => {
      this.hideModal(templateModal);
    });

    templateModal.addEventListener('click', (e) => {
      if (e.target === templateModal.querySelector('.modal-overlay')) {
        this.hideModal(templateModal);
      }
    });

    // SVG模态框
    const svgModal = document.getElementById('svg-modal');
    const svgClose = svgModal.querySelector('.modal-close');
    const svgCancel = document.getElementById('svg-cancel');
    const svgInsert = document.getElementById('svg-insert');
    const svgUpload = document.getElementById('svg-upload');
    const svgCode = document.getElementById('svg-code');
    const svgPreview = document.getElementById('svg-preview');

    svgClose.addEventListener('click', () => {
      this.hideModal(svgModal);
    });

    svgCancel.addEventListener('click', () => {
      this.hideModal(svgModal);
    });

    svgModal.addEventListener('click', (e) => {
      if (e.target === svgModal.querySelector('.modal-overlay')) {
        this.hideModal(svgModal);
      }
    });

    svgUpload.addEventListener('change', (e) => {
      this.handleSvgUpload(e.target.files[0]);
    });

    svgCode.addEventListener('input', () => {
      this.updateSvgPreview();
    });

    svgInsert.addEventListener('click', () => {
      this.insertSvg();
    });
  }

  onContentChange() {
    this.isDirty = true;
    this.updateStats();
    
    if (this.livePreview) {
      // 使用防抖来避免频繁更新预览
      clearTimeout(this.debounceTimer);
      this.debounceTimer = setTimeout(() => {
        this.updatePreview();
      }, 300);
    }
  }

  updateStats() {
    const content = this.htmlEditor.value;
    const charCount = content.length;
    const lineCount = content.split('\n').length;

    this.charCount.textContent = `字符数: ${charCount}`;
    this.lineCount.textContent = `行数: ${lineCount}`;
  }

  updatePreview() {
    const content = this.htmlEditor.value;
    let processedContent = content;

    if (this.autoConvert) {
      processedContent = this.convertHtmlForWeChat(content);
    }

    const previewDoc = this.previewFrame.contentDocument;
    previewDoc.open();
    previewDoc.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            padding: 20px;
            background: white;
          }
          * {
            box-sizing: border-box;
          }
        </style>
      </head>
      <body>
        ${processedContent}
      </body>
      </html>
    `);
    previewDoc.close();
  }

  convertHtmlForWeChat(html) {
    // 创建临时DOM元素进行处理
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;

    // 处理所有元素
    const elements = tempDiv.querySelectorAll('*');
    elements.forEach(el => {
      // 移除不支持的属性
      const unsupportedAttrs = ['class', 'id', 'onclick', 'onload', 'style'];
      unsupportedAttrs.forEach(attr => {
        if (attr !== 'style') {
          el.removeAttribute(attr);
        }
      });

      // 处理样式内联化
      this.inlineStyles(el);
    });

    // 处理SVG元素
    const svgs = tempDiv.querySelectorAll('svg');
    svgs.forEach(svg => {
      svg.setAttribute('style', 'display: inline-block; vertical-align: middle;');
    });

    return tempDiv.innerHTML;
  }

  inlineStyles(element) {
    const tagName = element.tagName.toLowerCase();
    let inlineStyle = '';

    // 根据标签类型添加默认样式
    switch (tagName) {
      case 'h1':
      case 'h2':
      case 'h3':
      case 'h4':
      case 'h5':
      case 'h6':
        inlineStyle += 'font-weight: bold; margin: 1em 0; ';
        break;
      case 'p':
        inlineStyle += 'margin: 1em 0; ';
        break;
      case 'strong':
      case 'b':
        inlineStyle += 'font-weight: bold; ';
        break;
      case 'em':
      case 'i':
        inlineStyle += 'font-style: italic; ';
        break;
      case 'u':
        inlineStyle += 'text-decoration: underline; ';
        break;
    }

    // 保留现有的style属性
    const existingStyle = element.getAttribute('style');
    if (existingStyle) {
      inlineStyle += existingStyle;
    }

    if (inlineStyle) {
      element.setAttribute('style', inlineStyle);
    }
  }

  formatCode() {
    const content = this.htmlEditor.value;
    try {
      // 简单的HTML格式化
      const formatted = this.formatHtml(content);
      this.htmlEditor.value = formatted;
      this.onContentChange();
    } catch (error) {
      this.showMessage('格式化失败: ' + error.message, 'error');
    }
  }

  formatHtml(html) {
    // 简单的HTML格式化实现
    let formatted = html
      .replace(/></g, '>\n<')
      .replace(/^\s*\n/gm, '')
      .split('\n');

    let indent = 0;
    const tab = '  ';
    
    formatted = formatted.map(line => {
      const trimmed = line.trim();
      if (!trimmed) return '';

      if (trimmed.startsWith('</')) {
        indent = Math.max(0, indent - 1);
      }

      const result = tab.repeat(indent) + trimmed;

      if (trimmed.startsWith('<') && !trimmed.startsWith('</') && !trimmed.endsWith('/>')) {
        indent++;
      }

      return result;
    });

    return formatted.join('\n');
  }

  clearEditor() {
    if (this.isDirty) {
      if (!confirm('确定要清空编辑器吗？未保存的内容将丢失。')) {
        return;
      }
    }
    
    this.htmlEditor.value = '';
    this.isDirty = false;
    this.currentFile = null;
    this.onContentChange();
  }

  newFile() {
    if (this.isDirty) {
      if (!confirm('当前文件有未保存的更改，确定要新建文件吗？')) {
        return;
      }
    }
    
    this.clearEditor();
  }

  openFile(file) {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      this.htmlEditor.value = e.target.result;
      this.currentFile = file.name;
      this.isDirty = false;
      this.onContentChange();
      this.showMessage('文件加载成功', 'success');
    };
    reader.onerror = () => {
      this.showMessage('文件读取失败', 'error');
    };
    reader.readAsText(file);
  }

  saveFile() {
    const content = this.htmlEditor.value;
    const filename = this.currentFile || 'wechat-html.html';
    
    const blob = new Blob([content], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    this.isDirty = false;
    this.showMessage('文件保存成功', 'success');
  }

  async insertToWeChat() {
    const content = this.htmlEditor.value;
    if (!content.trim()) {
      this.showMessage('请先输入HTML代码', 'error');
      return;
    }

    try {
      // 获取所有微信公众号编辑页面的标签页
      const tabs = await chrome.tabs.query({
        url: ['*://mp.weixin.qq.com/cgi-bin/appmsg*', '*://mp.weixin.qq.com/cgi-bin/appmsgdraft*']
      });

      if (tabs.length === 0) {
        this.showMessage('请先打开微信公众号编辑页面', 'error');
        return;
      }

      // 发送消息到第一个匹配的标签页
      await chrome.tabs.sendMessage(tabs[0].id, {
        action: 'insertHtml',
        data: {
          html: content,
          position: 'cursor',
          autoConvert: this.autoConvert
        }
      });

      this.showMessage('HTML代码已插入到微信编辑器', 'success');
    } catch (error) {
      console.error('插入失败:', error);
      this.showMessage('插入失败: ' + error.message, 'error');
    }
  }

  copyCode() {
    const content = this.htmlEditor.value;
    if (!content.trim()) {
      this.showMessage('没有可复制的内容', 'error');
      return;
    }

    navigator.clipboard.writeText(content).then(() => {
      this.showMessage('代码已复制到剪贴板', 'success');
    }).catch(() => {
      // 降级方案
      this.htmlEditor.select();
      document.execCommand('copy');
      this.showMessage('代码已复制到剪贴板', 'success');
    });
  }

  async showTemplateModal() {
    const modal = document.getElementById('template-modal');
    const templateGrid = document.getElementById('template-grid');
    
    this.showModal(modal);
    
    try {
      // 获取模板
      const response = await chrome.runtime.sendMessage({ action: 'getTemplates' });
      const templates = response.templates || [];
      
      templateGrid.innerHTML = '';
      
      templates.forEach(template => {
        const card = this.createTemplateCard(template);
        templateGrid.appendChild(card);
      });
    } catch (error) {
      templateGrid.innerHTML = '<div style="text-align: center; color: #666;">加载模板失败</div>';
    }
  }

  createTemplateCard(template) {
    const card = document.createElement('div');
    card.className = 'template-card';
    card.innerHTML = `
      <div class="template-preview">${template.html}</div>
      <div class="template-info">
        <div class="template-name">${template.name}</div>
        <div class="template-desc">点击使用此模板</div>
      </div>
    `;
    
    card.addEventListener('click', () => {
      this.insertTemplate(template.html);
      this.hideModal(document.getElementById('template-modal'));
    });
    
    return card;
  }

  insertTemplate(html) {
    const cursorPos = this.htmlEditor.selectionStart;
    const content = this.htmlEditor.value;
    const before = content.substring(0, cursorPos);
    const after = content.substring(cursorPos);
    
    this.htmlEditor.value = before + html + after;
    this.htmlEditor.focus();
    this.htmlEditor.setSelectionRange(cursorPos + html.length, cursorPos + html.length);
    
    this.onContentChange();
    this.showMessage('模板已插入', 'success');
  }

  showSvgModal() {
    const modal = document.getElementById('svg-modal');
    this.showModal(modal);
    
    // 清空SVG编辑器
    document.getElementById('svg-code').value = '';
    document.getElementById('svg-preview').innerHTML = '';
  }

  handleSvgUpload(file) {
    if (!file || file.type !== 'image/svg+xml') {
      this.showMessage('请选择有效的SVG文件', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const svgCode = e.target.result;
      document.getElementById('svg-code').value = svgCode;
      this.updateSvgPreview();
    };
    reader.readAsText(file);
  }

  updateSvgPreview() {
    const svgCode = document.getElementById('svg-code').value;
    const preview = document.getElementById('svg-preview');
    
    if (svgCode.trim()) {
      try {
        preview.innerHTML = svgCode;
      } catch (error) {
        preview.innerHTML = '<div style="color: #dc3545;">SVG代码格式错误</div>';
      }
    } else {
      preview.innerHTML = '';
    }
  }

  insertSvg() {
    const svgCode = document.getElementById('svg-code').value;
    if (!svgCode.trim()) {
      this.showMessage('请输入SVG代码', 'error');
      return;
    }

    this.insertTemplate(svgCode);
    this.hideModal(document.getElementById('svg-modal'));
  }

  showModal(modal) {
    modal.classList.add('show');
  }

  hideModal(modal) {
    modal.classList.remove('show');
  }

  toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }

  handleKeyboard(e) {
    // Ctrl+S 保存
    if (e.ctrlKey && e.key === 's') {
      e.preventDefault();
      this.saveFile();
    }
    
    // Ctrl+N 新建
    if (e.ctrlKey && e.key === 'n') {
      e.preventDefault();
      this.newFile();
    }
    
    // Ctrl+O 打开
    if (e.ctrlKey && e.key === 'o') {
      e.preventDefault();
      document.getElementById('file-input').click();
    }
    
    // F11 全屏
    if (e.key === 'F11') {
      e.preventDefault();
      this.toggleFullscreen();
    }
  }

  loadSettings() {
    const settings = localStorage.getItem('wechat-html-editor-settings');
    if (settings) {
      const parsed = JSON.parse(settings);
      this.autoConvert = parsed.autoConvert !== false;
      this.livePreview = parsed.livePreview !== false;
      
      this.autoConvertCheck.checked = this.autoConvert;
      this.livePreviewCheck.checked = this.livePreview;
    }
  }

  saveSettings() {
    const settings = {
      autoConvert: this.autoConvert,
      livePreview: this.livePreview
    };
    localStorage.setItem('wechat-html-editor-settings', JSON.stringify(settings));
  }

  closeEditor() {
    if (this.isDirty) {
      if (!confirm('您有未保存的更改，确定要关闭吗？')) {
        return;
      }
    }
    window.close();
  }

  showMessage(text, type = 'info') {
    // 创建消息提示
    const message = document.createElement('div');
    message.className = 'editor-message';
    message.textContent = text;
    message.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#17a2b8'};
      color: white;
      padding: 12px 20px;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 500;
      z-index: 10000;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      animation: slideInRight 0.3s ease-out;
    `;

    document.body.appendChild(message);

    // 3秒后移除
    setTimeout(() => {
      if (message.parentNode) {
        message.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(() => {
          if (message.parentNode) {
            message.parentNode.removeChild(message);
          }
        }, 300);
      }
    }, 3000);

    // 添加动画样式
    if (!document.getElementById('editor-message-styles')) {
      const styles = document.createElement('style');
      styles.id = 'editor-message-styles';
      styles.textContent = `
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        @keyframes slideOutRight {
          from {
            transform: translateX(0);
            opacity: 1;
          }
          to {
            transform: translateX(100%);
            opacity: 0;
          }
        }
      `;
      document.head.appendChild(styles);
    }
  }
}

// 页面加载完成后初始化编辑器
document.addEventListener('DOMContentLoaded', () => {
  new HtmlEditor();
}); 