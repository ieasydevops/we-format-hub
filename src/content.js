// 内容脚本 - 注入到微信公众号编辑页面
class WeChatHtmlInjector {
  constructor() {
    this.isInitialized = false;
    this.observer = null;
    this.init();
  }

  init() {
    // 等待页面加载完成
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.initializeInjector());
    } else {
      this.initializeInjector();
    }
  }

  initializeInjector() {
    // 延迟初始化，确保微信编辑器已加载
    setTimeout(() => {
      this.findAndInjectButton();
      this.startObserving();
    }, 2000);
  }

  findAndInjectButton() {
    if (this.isInitialized) return;

    // 查找微信编辑器工具栏
    const toolbar = this.findEditorToolbar();
    if (toolbar) {
      this.injectHtmlButton(toolbar);
      this.isInitialized = true;
    }
  }

  findEditorToolbar() {
    console.log('开始查找微信编辑器工具栏...');
    
    // 多种可能的工具栏选择器
    const toolbarSelectors = [
      '.edui-toolbar',
      '.tool-container', 
      '.edui-editor-toolbarbox',
      '[data-role="toolbar"]',
      '.js_editor_toolbar',
      '.edit_tool_bar',
      '.editor-toolbar',
      '.rich_media_tool',
      '.edui-editor-toolbarcontainer'
    ];

    for (const selector of toolbarSelectors) {
      const toolbar = document.querySelector(selector);
      if (toolbar) {
        console.log('✅ 找到工具栏:', selector, toolbar);
        return toolbar;
      } else {
        console.log('❌ 未找到工具栏:', selector);
      }
    }

    // 如果没找到，尝试查找包含工具按钮的容器
    console.log('尝试查找工具按钮容器...');
    const buttonSelectors = [
      '[data-editor-type="button"]', 
      '.edui-button', 
      '.tool-item',
      '.edui-btn',
      '.js_editor_btn'
    ];
    
    for (const buttonSelector of buttonSelectors) {
      const buttons = document.querySelectorAll(buttonSelector);
      console.log(`查找按钮选择器 ${buttonSelector}: 找到 ${buttons.length} 个按钮`);
      if (buttons.length > 0) {
        const container = buttons[0].parentElement;
        console.log('✅ 通过按钮找到容器:', container);
        return container;
      }
    }

    console.error('❌ 未找到任何工具栏或按钮容器');
    return null;
  }

  injectHtmlButton(toolbar) {
    // 创建HTML插入按钮
    const htmlButton = this.createHtmlButton();
    
    // 查找合适的插入位置
    const insertPosition = toolbar.querySelector('.edui-button') || toolbar.firstElementChild;
    
    if (insertPosition) {
      insertPosition.parentNode.insertBefore(htmlButton, insertPosition.nextSibling);
    } else {
      toolbar.appendChild(htmlButton);
    }

    console.log('HTML插入按钮已添加');
  }

  createHtmlButton() {
    const button = document.createElement('div');
    button.className = 'html-injector-btn';
    button.innerHTML = `
      <div class="html-btn-container">
        <svg class="html-btn-icon" viewBox="0 0 24 24" width="16" height="16">
          <path d="M12 15.5A3.5 3.5 0 0 1 8.5 12A3.5 3.5 0 0 1 12 8.5a3.5 3.5 0 0 1 3.5 3.5a3.5 3.5 0 0 1-3.5 3.5m7.43-2.53c.04-.32.07-.64.07-.97c0-.33-.03-.66-.07-1l2.11-1.63c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.31-.61-.22l-2.49 1c-.52-.39-1.06-.73-1.69-.98l-.37-2.65A.506.506 0 0 0 14 2h-4c-.25 0-.46.18-.5.42l-.37 2.65c-.63.25-1.17.59-1.69.98l-2.49-1c-.22-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64L4.57 11c-.04.34-.07.67-.07 1c0 .33.03.65.07.97l-2.11 1.66c-.19.15-.25.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1.01c.52.4 1.06.74 1.69.99l.37 2.65c.04.24.25.42.5.42h4c.25 0 .46-.18.5-.42l.37-2.65c.63-.26 1.17-.59 1.69-.99l2.49 1.01c.22.08.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.66Z"/>
        </svg>
        <span class="html-btn-text">HTML</span>
      </div>
    `;

    // 添加点击事件
    button.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.showHtmlModal();
    });

    return button;
  }

  showHtmlModal() {
    // 创建模态框
    const modal = this.createHtmlModal();
    document.body.appendChild(modal);

    // 显示模态框
    setTimeout(() => {
      modal.classList.add('show');
    }, 10);
  }

  createHtmlModal() {
    const modal = document.createElement('div');
    modal.className = 'html-injector-modal';
    modal.innerHTML = `
      <div class="html-modal-overlay">
        <div class="html-modal-content">
          <div class="html-modal-header">
            <h3>插入HTML代码</h3>
            <button class="html-modal-close">&times;</button>
          </div>
          <div class="html-modal-body">
            <div class="html-tabs">
              <button class="html-tab active" data-tab="editor">代码编辑</button>
              <button class="html-tab" data-tab="templates">模板库</button>
              <button class="html-tab" data-tab="svg">SVG工具</button>
            </div>
            
            <div class="html-tab-content active" data-content="editor">
              <div class="html-format-tips">
                <strong>📝 格式说明：</strong>
                <span>请输入HTML内容片段，不要包含DOCTYPE、html、head、body等文档结构标签</span>
                <button class="tips-toggle" onclick="this.nextElementSibling.style.display = this.nextElementSibling.style.display === 'none' ? 'block' : 'none'">示例</button>
                <div class="tips-examples" style="display: none;">
                  <p><strong>✅ 正确格式：</strong></p>
                  <code>&lt;div style="padding: 20px;"&gt;&lt;h3&gt;标题&lt;/h3&gt;&lt;p&gt;内容&lt;/p&gt;&lt;/div&gt;</code>
                  <p><strong>❌ 错误格式：</strong></p>
                  <code>&lt;!DOCTYPE html&gt;&lt;html&gt;&lt;head&gt;...&lt;/head&gt;&lt;body&gt;...&lt;/body&gt;&lt;/html&gt;</code>
                </div>
              </div>
              <div class="html-editor-container">
                <textarea class="html-code-input" placeholder="输入HTML内容片段，例如：&#10;&lt;div style=&quot;padding: 20px; background: #f0f8ff;&quot;&gt;&#10;  &lt;h3&gt;我的标题&lt;/h3&gt;&#10;  &lt;p&gt;这里是内容...&lt;/p&gt;&#10;&lt;/div&gt;"></textarea>
                <div class="html-preview" id="html-preview">
                  <div class="preview-placeholder">预览区域</div>
                </div>
              </div>
              <div class="html-options">
                <label>
                  <input type="checkbox" id="auto-convert" checked>
                  自动转换为微信兼容格式
                </label>
                <label>
                  <input type="radio" name="position" value="cursor" checked>
                  插入到光标位置
                </label>
                <label>
                  <input type="radio" name="position" value="end">
                  插入到文章末尾
                </label>
              </div>
            </div>
            
            <div class="html-tab-content" data-content="templates">
              <div class="template-grid" id="template-grid">
                <div class="template-loading">加载模板中...</div>
              </div>
            </div>
            
            <div class="html-tab-content" data-content="svg">
              <div class="svg-tools">
                <div class="svg-upload">
                  <input type="file" id="svg-file" accept=".svg" style="display: none;">
                  <button class="svg-upload-btn">上传SVG文件</button>
                </div>
                <div class="svg-editor">
                  <textarea class="svg-code-input" placeholder="或直接粘贴SVG代码..."></textarea>
                </div>
                <div class="svg-preview" id="svg-preview"></div>
              </div>
            </div>
          </div>
          <div class="html-modal-footer">
            <button class="html-btn-cancel">取消</button>
            <button class="html-btn-insert">插入HTML</button>
          </div>
        </div>
      </div>
    `;

    this.initModalEvents(modal);
    return modal;
  }

  initModalEvents(modal) {
    // 关闭模态框
    const closeBtn = modal.querySelector('.html-modal-close');
    const cancelBtn = modal.querySelector('.html-btn-cancel');
    const overlay = modal.querySelector('.html-modal-overlay');

    [closeBtn, cancelBtn].forEach(btn => {
      btn.addEventListener('click', () => this.closeModal(modal));
    });

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        this.closeModal(modal);
      }
    });

    // 标签切换
    const tabs = modal.querySelectorAll('.html-tab');
    const contents = modal.querySelectorAll('.html-tab-content');

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const targetTab = tab.getAttribute('data-tab');
        
        tabs.forEach(t => t.classList.remove('active'));
        contents.forEach(c => c.classList.remove('active'));
        
        tab.classList.add('active');
        modal.querySelector(`[data-content="${targetTab}"]`).classList.add('active');
        
        if (targetTab === 'templates') {
          this.loadTemplates(modal);
        }
      });
    });

    // 代码预览
    const codeInput = modal.querySelector('.html-code-input');
    const preview = modal.querySelector('#html-preview');

    codeInput.addEventListener('input', () => {
      this.updatePreview(codeInput.value, preview);
    });

    // SVG处理
    const svgFile = modal.querySelector('#svg-file');
    const svgUploadBtn = modal.querySelector('.svg-upload-btn');
    const svgCodeInput = modal.querySelector('.svg-code-input');
    const svgPreview = modal.querySelector('#svg-preview');

    svgUploadBtn.addEventListener('click', () => svgFile.click());
    svgFile.addEventListener('change', (e) => this.handleSvgUpload(e, svgCodeInput, svgPreview));
    svgCodeInput.addEventListener('input', () => this.updateSvgPreview(svgCodeInput.value, svgPreview));

    // 插入HTML
    const insertBtn = modal.querySelector('.html-btn-insert');
    insertBtn.addEventListener('click', () => this.insertHtml(modal));
  }

  updatePreview(html, preview) {
    if (html.trim()) {
      preview.innerHTML = html;
    } else {
      preview.innerHTML = '<div class="preview-placeholder">预览区域</div>';
    }
  }

  updateSvgPreview(svg, preview) {
    if (svg.trim()) {
      preview.innerHTML = svg;
    } else {
      preview.innerHTML = '';
    }
  }

  handleSvgUpload(event, codeInput, preview) {
    const file = event.target.files[0];
    if (file && file.type === 'image/svg+xml') {
      const reader = new FileReader();
      reader.onload = (e) => {
        const svgContent = e.target.result;
        codeInput.value = svgContent;
        this.updateSvgPreview(svgContent, preview);
      };
      reader.readAsText(file);
    }
  }

  async loadTemplates(modal) {
    const templateGrid = modal.querySelector('#template-grid');
    
    try {
      const response = await chrome.runtime.sendMessage({ action: 'getTemplates' });
      const templates = response.templates;
      
      templateGrid.innerHTML = '';
      
      templates.forEach(template => {
        const templateCard = document.createElement('div');
        templateCard.className = 'template-card';
        templateCard.innerHTML = `
          <div class="template-preview">${template.html}</div>
          <div class="template-info">
            <h4>${template.name}</h4>
            <button class="template-use-btn" data-html="${encodeURIComponent(template.html)}">使用</button>
          </div>
        `;
        
        templateCard.querySelector('.template-use-btn').addEventListener('click', (e) => {
          const html = decodeURIComponent(e.target.getAttribute('data-html'));
          modal.querySelector('.html-code-input').value = html;
          modal.querySelector('.html-tab[data-tab="editor"]').click();
          this.updatePreview(html, modal.querySelector('#html-preview'));
        });
        
        templateGrid.appendChild(templateCard);
      });
    } catch (error) {
      templateGrid.innerHTML = '<div class="template-error">加载模板失败</div>';
    }
  }

  insertHtml(modal) {
    console.log('开始处理HTML插入...');
    const activeContent = modal.querySelector('.html-tab-content.active');
    let html = '';
    
    if (activeContent.getAttribute('data-content') === 'editor') {
      html = modal.querySelector('.html-code-input').value;
    } else if (activeContent.getAttribute('data-content') === 'svg') {
      html = modal.querySelector('.svg-code-input').value;
    }
    
    if (!html.trim()) {
      alert('请输入HTML代码');
      return;
    }
    
    // 验证和清理HTML
    const cleanedHtml = this.validateAndCleanHtml(html);
    if (!cleanedHtml) {
      return;
    }
    
    const autoConvert = modal.querySelector('#auto-convert').checked;
    const position = modal.querySelector('input[name="position"]:checked').value;
    
    console.log('HTML插入参数:', { html: cleanedHtml, position, autoConvert });
    
    // 检查扩展上下文是否有效
    if (!chrome.runtime || !chrome.runtime.id) {
      alert('插件已失效，请刷新页面重试');
      return;
    }
    
    try {
      // 发送插入消息
      chrome.runtime.sendMessage({
        action: 'insertHtml',
        data: {
          html: cleanedHtml,
          position: position,
          autoConvert: autoConvert
        }
      }, (response) => {
        if (chrome.runtime.lastError) {
          console.error('发送消息失败:', chrome.runtime.lastError);
          this.handleInsertError('通信失败: ' + chrome.runtime.lastError.message);
        } else if (response && response.success) {
          console.log('✅ HTML插入成功:', response.message);
          this.showSuccessNotification('HTML代码插入成功！');
        } else {
          console.error('❌ HTML插入失败:', response);
          this.handleInsertError(response?.error || '未知错误');
        }
      });
    } catch (error) {
      console.error('插入过程异常:', error);
      this.handleInsertError('插件异常: ' + error.message);
    }
    
    this.closeModal(modal);
  }

  validateAndCleanHtml(html) {
    // 检查是否是完整的HTML文档
    if (html.includes('<!DOCTYPE') || html.includes('<html') || html.includes('<head') || html.includes('<body')) {
      const confirmed = confirm(
        '检测到完整的HTML文档结构，微信编辑器不支持此格式。\n\n' +
        '是否自动提取body内容？\n\n' + 
        '点击"确定"提取内容，点击"取消"手动修改。'
      );
      
      if (!confirmed) {
        return null;
      }
      
      // 提取body内容
      try {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;
        const bodyElement = tempDiv.querySelector('body');
        if (bodyElement) {
          return bodyElement.innerHTML;
        } else {
          // 如果没有body标签，尝试移除文档结构标签
          let cleaned = html
            .replace(/<!DOCTYPE[^>]*>/gi, '')
            .replace(/<\/?html[^>]*>/gi, '')
            .replace(/<head[\s\S]*?<\/head>/gi, '')
            .replace(/<\/?body[^>]*>/gi, '')
            .trim();
          return cleaned;
        }
      } catch (error) {
        alert('HTML文档解析失败，请手动修改为内容片段格式');
        return null;
      }
    }
    
    // 检查是否有禁用的标签
    const forbiddenTags = ['script', 'link', 'meta', 'title'];
    for (const tag of forbiddenTags) {
      if (html.toLowerCase().includes(`<${tag}`)) {
        alert(`检测到不支持的标签 <${tag}>，请移除后重试`);
        return null;
      }
    }
    
    return html;
  }

  handleInsertError(errorMessage) {
    // 检查是否是扩展上下文失效错误
    if (errorMessage.includes('Extension context invalidated') || 
        errorMessage.includes('context invalidated')) {
      alert(
        '插件已失效，这通常发生在插件重新加载后。\n\n' +
        '解决方法：\n' +
        '1. 刷新当前页面\n' +
        '2. 重新访问微信编辑页面\n' +
        '3. 如问题持续，请重新安装插件'
      );
    } else {
      alert('插入失败：' + errorMessage);
    }
  }

  closeModal(modal) {
    modal.classList.remove('show');
    setTimeout(() => {
      if (modal.parentNode) {
        modal.parentNode.removeChild(modal);
      }
    }, 300);
  }

  showSuccessNotification(message) {
    // 创建成功通知
    const notification = document.createElement('div');
    notification.className = 'html-success-notification';
    notification.innerHTML = `
      <div style="
        position: fixed;
        top: 20px;
        right: 20px;
        background: #4CAF50;
        color: white;
        padding: 15px 20px;
        border-radius: 6px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        z-index: 10000;
        font-size: 14px;
        font-weight: 500;
        display: flex;
        align-items: center;
        gap: 8px;
        animation: slideIn 0.3s ease-out;
      ">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
        </svg>
        ${message}
      </div>
    `;
    
    // 添加动画样式
    if (!document.querySelector('#html-notification-style')) {
      const style = document.createElement('style');
      style.id = 'html-notification-style';
      style.textContent = `
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `;
      document.head.appendChild(style);
    }
    
    document.body.appendChild(notification);
    
    // 3秒后自动移除
    setTimeout(() => {
      if (notification.parentNode) {
        notification.style.animation = 'slideIn 0.3s ease-out reverse';
        setTimeout(() => {
          if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
          }
        }, 300);
      }
    }, 3000);
  }

  startObserving() {
    // 观察DOM变化，处理动态加载的编辑器
    this.observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            // 检查是否有新的编辑器工具栏
            if (!this.isInitialized) {
              setTimeout(() => this.findAndInjectButton(), 1000);
            }
          }
        });
      });
    });

    this.observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  destroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
  }
}

// 样式修复功能
function ensureStylesLoaded() {
  // 检查是否有我们的样式
  const btn = document.querySelector('.html-injector-btn');
  if (btn) {
    const styles = window.getComputedStyle(btn);
    if (styles.display === 'none' || styles.background === 'rgba(0, 0, 0, 0)') {
      console.warn('🎨 检测到样式加载问题，注入紧急CSS...');
      injectEmergencyStyles();
    }
  }
}

function injectEmergencyStyles() {
  // 检查是否已经注入
  if (document.getElementById('weixin-html-plugin-emergency-css')) {
    return;
  }
  
  const emergencyCSS = `
    /* 紧急样式修复 */
    div.html-injector-btn {
      display: inline-block !important;
      margin: 0 4px !important;
      cursor: pointer !important;
      position: relative !important;
      z-index: 999999 !important;
    }
    
    div.html-injector-btn .html-btn-container {
      display: flex !important;
      align-items: center !important;
      padding: 6px 12px !important;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
      border: 1px solid #ddd !important;
      border-radius: 4px !important;
      color: white !important;
      font-size: 12px !important;
      transition: all 0.3s ease !important;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1) !important;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
      text-decoration: none !important;
    }
    
    div.html-injector-btn .html-btn-container:hover {
      background: linear-gradient(135deg, #764ba2 0%, #667eea 100%) !important;
      box-shadow: 0 4px 8px rgba(0,0,0,0.15) !important;
      transform: translateY(-1px) !important;
    }
    
    div.html-injector-btn .html-btn-icon {
      margin-right: 6px !important;
      fill: currentColor !important;
      width: 16px !important;
      height: 16px !important;
    }
    
    div.html-injector-btn .html-btn-text {
      font-weight: 500 !important;
      white-space: nowrap !important;
    }
    
    div.html-injector-modal {
      position: fixed !important;
      top: 0 !important;
      left: 0 !important;
      width: 100% !important;
      height: 100% !important;
      z-index: 999999 !important;
      opacity: 0 !important;
      visibility: hidden !important;
      transition: opacity 0.3s ease, visibility 0.3s ease !important;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
    }
    
    div.html-injector-modal.show {
      opacity: 1 !important;
      visibility: visible !important;
    }
    
    div.html-injector-modal .html-modal-overlay {
      position: absolute !important;
      top: 0 !important;
      left: 0 !important;
      width: 100% !important;
      height: 100% !important;
      background: rgba(0, 0, 0, 0.5) !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      padding: 20px !important;
    }
    
    div.html-injector-modal .html-modal-content {
      background: white !important;
      border-radius: 12px !important;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3) !important;
      width: 100% !important;
      max-width: 900px !important;
      max-height: 90vh !important;
      display: flex !important;
      flex-direction: column !important;
      overflow: hidden !important;
    }
  `;
  
  const style = document.createElement('style');
  style.textContent = emergencyCSS;
  style.id = 'weixin-html-plugin-emergency-css';
  document.head.appendChild(style);
  
  console.log('✅ 紧急CSS样式已注入');
}

// 初始化注入器
let injector = null;

// 检查是否在微信公众号编辑页面
if (window.location.href.includes('mp.weixin.qq.com') && 
    (window.location.href.includes('appmsg') || window.location.href.includes('draft'))) {
  injector = new WeChatHtmlInjector();
  
  // 延迟检查样式
  setTimeout(() => {
    ensureStylesLoaded();
  }, 2000);
}

// 页面卸载时清理
window.addEventListener('beforeunload', () => {
  if (injector) {
    injector.destroy();
  }
}); 