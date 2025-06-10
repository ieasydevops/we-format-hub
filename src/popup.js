// 弹窗脚本 - 处理用户交互和设置
class PopupController {
  constructor() {
    this.settings = {
      autoConvert: true,
      enableSVG: true,
      defaultTemplate: 'basic'
    };
    this.init();
  }

  async init() {
    await this.loadSettings();
    this.initializeElements();
    this.checkPageStatus();
    this.loadTemplates();
    this.setupEventListeners();
  }

  // 加载设置
  async loadSettings() {
    try {
      const result = await chrome.storage.sync.get(['userSettings']);
      if (result.userSettings) {
        this.settings = { ...this.settings, ...result.userSettings };
      }
    } catch (error) {
      console.error('加载设置失败:', error);
    }
  }

  // 保存设置
  async saveSettings() {
    try {
      await chrome.storage.sync.set({ userSettings: this.settings });
    } catch (error) {
      console.error('保存设置失败:', error);
    }
  }

  // 初始化界面元素
  initializeElements() {
    // 设置复选框状态
    const autoConvertCheckbox = document.getElementById('auto-convert');
    const enableSvgCheckbox = document.getElementById('enable-svg');

    if (autoConvertCheckbox) {
      autoConvertCheckbox.checked = this.settings.autoConvert;
    }
    if (enableSvgCheckbox) {
      enableSvgCheckbox.checked = this.settings.enableSVG;
    }
  }

  // 检查页面状态
  async checkPageStatus() {
    const statusIndicator = document.getElementById('page-status');
    const statusText = document.getElementById('status-text');

    try {
      // 获取当前活动标签页
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      if (!tab) {
        this.updateStatus('inactive', '无法获取当前页面');
        return;
      }

      // 检查是否在微信公众号编辑页面
      const isWeChatPage = tab.url.includes('mp.weixin.qq.com') && 
                          (tab.url.includes('appmsg') || tab.url.includes('draft'));

      if (isWeChatPage) {
        this.updateStatus('active', '检测到微信公众号编辑页面');
        this.enableActions();
      } else {
        this.updateStatus('inactive', '请在微信公众号编辑页面使用此插件');
        this.disableActions();
      }
    } catch (error) {
      console.error('检查页面状态失败:', error);
      this.updateStatus('inactive', '页面检测失败');
      this.disableActions();
    }
  }

  // 更新状态显示
  updateStatus(status, text) {
    const statusIndicator = document.getElementById('page-status');
    const statusText = document.getElementById('status-text');

    if (statusIndicator) {
      statusIndicator.className = `status-indicator ${status}`;
    }
    if (statusText) {
      statusText.textContent = text;
    }
  }

  // 启用操作按钮
  enableActions() {
    const buttons = document.querySelectorAll('.action-btn');
    buttons.forEach(btn => {
      btn.disabled = false;
      btn.style.opacity = '1';
      btn.style.pointerEvents = 'auto';
    });
  }

  // 禁用操作按钮
  disableActions() {
    const buttons = document.querySelectorAll('.action-btn');
    buttons.forEach(btn => {
      btn.disabled = true;
      btn.style.opacity = '0.5';
      btn.style.pointerEvents = 'none';
    });
  }

  // 加载模板
  async loadTemplates() {
    const templateList = document.getElementById('template-list');
    
    try {
      const response = await chrome.runtime.sendMessage({ action: 'getTemplates' });
      const templates = response.templates || [];
      
      templateList.innerHTML = '';
      
      if (templates.length === 0) {
        templateList.innerHTML = '<div class="template-error">没有可用模板</div>';
        return;
      }

      templates.slice(0, 3).forEach(template => {
        const templateItem = this.createTemplateItem(template);
        templateList.appendChild(templateItem);
      });

    } catch (error) {
      console.error('加载模板失败:', error);
      templateList.innerHTML = '<div class="template-error">加载模板失败</div>';
    }
  }

  // 创建模板项
  createTemplateItem(template) {
    const item = document.createElement('div');
    item.className = 'template-item';
    
    item.innerHTML = `
      <div class="template-info">
        <div class="template-name">${template.name}</div>
        <div class="template-desc">点击快速插入</div>
      </div>
      <button class="template-use" data-template-id="${template.id}">使用</button>
    `;

    // 添加使用模板事件
    const useBtn = item.querySelector('.template-use');
    useBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.useTemplate(template);
    });

    // 添加整体点击事件
    item.addEventListener('click', () => {
      this.useTemplate(template);
    });

    return item;
  }

  // 使用模板
  async useTemplate(template) {
    try {
      // 获取当前活动标签页
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      if (!tab) {
        this.showMessage('无法获取当前页面', 'error');
        return;
      }

      // 发送插入HTML消息
      await chrome.tabs.sendMessage(tab.id, {
        action: 'insertHtml',
        data: {
          html: template.html,
          position: 'cursor',
          autoConvert: this.settings.autoConvert
        }
      });

      this.showMessage('模板插入成功', 'success');
      window.close();
    } catch (error) {
      console.error('使用模板失败:', error);
      this.showMessage('模板插入失败', 'error');
    }
  }

  // 设置事件监听器
  setupEventListeners() {
    // 打开编辑器按钮
    const openEditorBtn = document.getElementById('open-editor');
    if (openEditorBtn) {
      openEditorBtn.addEventListener('click', () => this.openEditor());
    }

    // 快速插入按钮
    const quickInsertBtn = document.getElementById('quick-insert');
    if (quickInsertBtn) {
      quickInsertBtn.addEventListener('click', () => this.openQuickInsert());
    }

    // 设置复选框
    const autoConvertCheckbox = document.getElementById('auto-convert');
    const enableSvgCheckbox = document.getElementById('enable-svg');

    if (autoConvertCheckbox) {
      autoConvertCheckbox.addEventListener('change', (e) => {
        this.settings.autoConvert = e.target.checked;
        this.saveSettings();
      });
    }

    if (enableSvgCheckbox) {
      enableSvgCheckbox.addEventListener('change', (e) => {
        this.settings.enableSVG = e.target.checked;
        this.saveSettings();
      });
    }

    // 帮助和反馈链接
    const helpLink = document.getElementById('help-link');
    const feedbackLink = document.getElementById('feedback-link');

    if (helpLink) {
      helpLink.addEventListener('click', (e) => {
        e.preventDefault();
        this.openHelp();
      });
    }

    if (feedbackLink) {
      feedbackLink.addEventListener('click', (e) => {
        e.preventDefault();
        this.openFeedback();
      });
    }
  }

  // 打开HTML编辑器
  async openEditor() {
    try {
      await chrome.runtime.sendMessage({ action: 'openEditor' });
      window.close();
    } catch (error) {
      console.error('打开编辑器失败:', error);
      this.showMessage('打开编辑器失败', 'error');
    }
  }

  // 打开快速插入
  async openQuickInsert() {
    try {
      // 获取当前活动标签页
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      if (!tab) {
        this.showMessage('无法获取当前页面', 'error');
        return;
      }

      // 注入脚本显示HTML模态框
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
          // 触发显示HTML插入模态框
          const event = new CustomEvent('showHtmlModal');
          document.dispatchEvent(event);
        }
      });

      window.close();
    } catch (error) {
      console.error('打开快速插入失败:', error);
      this.showMessage('打开快速插入失败', 'error');
    }
  }

  // 打开帮助页面
  openHelp() {
    chrome.tabs.create({
      url: 'https://github.com/your-repo/wexin-plugin/wiki',
      active: true
    });
  }

  // 打开反馈页面
  openFeedback() {
    chrome.tabs.create({
      url: 'https://github.com/your-repo/wexin-plugin/issues',
      active: true
    });
  }

  // 显示消息提示
  showMessage(text, type = 'info') {
    // 创建消息提示元素
    const message = document.createElement('div');
    message.className = `popup-message ${type}`;
    message.textContent = text;
    message.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#17a2b8'};
      color: white;
      padding: 12px 20px;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 500;
      z-index: 10000;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      animation: slideInDown 0.3s ease-out;
    `;

    document.body.appendChild(message);

    // 3秒后自动移除
    setTimeout(() => {
      if (message.parentNode) {
        message.style.animation = 'slideOutUp 0.3s ease-out';
        setTimeout(() => {
          if (message.parentNode) {
            message.parentNode.removeChild(message);
          }
        }, 300);
      }
    }, 3000);

    // 添加CSS动画
    if (!document.getElementById('popup-message-styles')) {
      const styles = document.createElement('style');
      styles.id = 'popup-message-styles';
      styles.textContent = `
        @keyframes slideInDown {
          from {
            transform: translate(-50%, -100%);
            opacity: 0;
          }
          to {
            transform: translate(-50%, 0);
            opacity: 1;
          }
        }
        @keyframes slideOutUp {
          from {
            transform: translate(-50%, 0);
            opacity: 1;
          }
          to {
            transform: translate(-50%, -100%);
            opacity: 0;
          }
        }
      `;
      document.head.appendChild(styles);
    }
  }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
  new PopupController();
});

// 监听来自background的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'updateStatus') {
    // 更新状态显示
    const controller = window.popupController;
    if (controller) {
      controller.updateStatus(request.status, request.text);
    }
  }
});

// 处理页面焦点事件，重新检查状态
window.addEventListener('focus', () => {
  const controller = window.popupController;
  if (controller) {
    controller.checkPageStatus();
  }
}); 