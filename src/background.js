// 背景脚本 - 处理扩展生命周期和消息传递
chrome.runtime.onInstalled.addListener(() => {
  console.log('微信HTML插件已安装');
  
  // 初始化默认设置
  chrome.storage.sync.set({
    htmlTemplates: getDefaultTemplates(),
    userSettings: {
      autoConvert: true,
      enableSVG: true,
      defaultTemplate: 'basic'
    }
  });
});

// 处理来自content script的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('后台脚本收到消息:', request);
  
  switch (request.action) {
    case 'ping':
      // 用于测试通信的ping消息
      sendResponse({ status: 'pong', timestamp: Date.now() });
      break;
    case 'openEditor':
      openHtmlEditor(request.data);
      sendResponse({ success: true });
      break;
    case 'insertHtml':
      insertHtmlToWeChat(request.data, sender.tab.id)
        .then(() => {
          sendResponse({ success: true, message: 'HTML插入成功' });
        })
        .catch((error) => {
          console.error('插入HTML失败:', error);
          sendResponse({ success: false, error: error.message });
        });
      return true; // 表示将异步发送响应
    case 'getTemplates':
      getHtmlTemplates().then(templates => {
        sendResponse({ templates });
      }).catch(error => {
        sendResponse({ error: error.message });
      });
      return true;
    case 'saveTemplate':
      saveHtmlTemplate(request.data)
        .then(() => {
          sendResponse({ success: true });
        })
        .catch((error) => {
          sendResponse({ success: false, error: error.message });
        });
      return true;
    default:
      sendResponse({ error: 'Unknown action' });
      break;
  }
});

// 打开HTML编辑器
function openHtmlEditor(data) {
  chrome.tabs.create({
    url: chrome.runtime.getURL('src/editor.html'),
    active: true
  });
}

// 插入HTML到微信编辑器
async function insertHtmlToWeChat(htmlData, tabId) {
  try {
    await chrome.scripting.executeScript({
      target: { tabId: tabId },
      func: insertHtmlContent,
      args: [htmlData]
    });
  } catch (error) {
    console.error('插入HTML失败:', error);
  }
}

// 注入到页面的函数
function insertHtmlContent(htmlData) {
  console.log('开始插入HTML:', htmlData);
  const { html, position, autoConvert } = htmlData;
  
  // 转换HTML为微信兼容格式的函数 (内联定义)
  function convertHtmlForWeChat(html) {
    if (!autoConvert) return html;
    
    try {
      // 创建临时DOM元素
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = html;
      
      // 处理样式内联化
      const elements = tempDiv.querySelectorAll('*');
      elements.forEach(el => {
        // 移除不支持的属性
        const unsupportedAttrs = ['class', 'id', 'onclick', 'onload', 'onmouseover', 'onmouseout'];
        unsupportedAttrs.forEach(attr => {
          el.removeAttribute(attr);
        });
        
        // 确保基本样式
        if (el.tagName.toLowerCase() === 'div' && !el.getAttribute('style')) {
          el.setAttribute('style', 'margin: 0; padding: 0;');
        }
      });
      
      // 处理SVG
      const svgs = tempDiv.querySelectorAll('svg');
      svgs.forEach(svg => {
        svg.setAttribute('style', 'display: inline-block; vertical-align: middle;');
      });
      
      return tempDiv.innerHTML;
    } catch (error) {
      console.error('HTML转换失败:', error);
      return html;
    }
  }

  // 在光标处插入HTML的函数
  function insertAtCursor(editor, html) {
    try {
      // 方法1: UEditor API（最推荐）
      if (editorType === 'ueditor-api' && editor.execCommand) {
        editor.focus();
        editor.execCommand('insertHtml', html);
        console.log('✅ 使用UEditor API插入HTML（光标位置）');
        return;
      }
      
      // 方法2: 传统UEditor实例
      if (window.UE && editorType.includes('ueditor')) {
        const ueInstance = window.UE.getEditor('ueditor_0');
        if (ueInstance && ueInstance.ready) {
          ueInstance.focus();
          ueInstance.execCommand('insertHtml', html);
          console.log('✅ 使用UEditor实例插入HTML（光标位置）');
          return;
        }
      }
      
      // 方法3: DOM操作（备用）
      insertViaDom(editor, html, 'cursor');
      
    } catch (error) {
      console.error('光标插入失败:', error);
      insertAtEnd(editor, html);
    }
  }

  // 在末尾插入HTML的函数
  function insertAtEnd(editor, html) {
    try {
      // 方法1: UEditor API（最推荐）
      if (editorType === 'ueditor-api' && editor.execCommand) {
        editor.focus();
        // 移动到内容末尾
        editor.execCommand('selectall');
        editor.execCommand('getselectionrange').moveToEnd();
        editor.execCommand('insertHtml', html);
        console.log('✅ 使用UEditor API插入HTML（末尾）');
        return;
      }
      
      // 方法2: 传统UEditor实例
      if (window.UE && editorType.includes('ueditor')) {
        const ueInstance = window.UE.getEditor('ueditor_0');
        if (ueInstance && ueInstance.ready) {
          ueInstance.focus();
          const range = ueInstance.selection.getRange();
          range.setStartAfter(ueInstance.body.lastChild || ueInstance.body);
          range.collapse(true);
          ueInstance.selection.getSelection().removeAllRanges();
          ueInstance.selection.getSelection().addRange(range);
          ueInstance.execCommand('insertHtml', html);
          console.log('✅ 使用UEditor实例插入HTML（末尾）');
          return;
        }
      }
      
      // 方法3: DOM操作（备用）
      insertViaDom(editor, html, 'end');
      
    } catch (error) {
      console.error('末尾插入失败:', error);
      throw new Error('所有插入方法都失败了: ' + error.message);
    }
  }
  
  // DOM操作插入方法（备用）
  function insertViaDom(editor, html, position) {
    try {
      // 如果是UEditor API实例，需要获取实际的编辑区域
      let targetElement = editor;
      if (editorType === 'ueditor-api') {
        targetElement = editor.body || editor.document.body;
      }
      
      targetElement.focus();
      
      if (position === 'cursor') {
        // 光标位置插入
        const editorWindow = targetElement.ownerDocument.defaultView || window;
        const selection = editorWindow.getSelection();
        
        let range;
        if (selection.rangeCount > 0) {
          range = selection.getRangeAt(0);
        } else {
          range = targetElement.ownerDocument.createRange();
          range.selectNodeContents(targetElement);
          range.collapse(false);
        }
        
        // 确保range在编辑器内
        if (!targetElement.contains(range.commonAncestorContainer)) {
          range = targetElement.ownerDocument.createRange();
          range.selectNodeContents(targetElement);
          range.collapse(false);
        }
        
        // 创建并插入HTML
        const tempDiv = targetElement.ownerDocument.createElement('div');
        tempDiv.innerHTML = html;
        
        const fragment = targetElement.ownerDocument.createDocumentFragment();
        while (tempDiv.firstChild) {
          fragment.appendChild(tempDiv.firstChild);
        }
        
        range.deleteContents();
        range.insertNode(fragment);
        range.collapse(false);
        selection.removeAllRanges();
        selection.addRange(range);
        
        console.log('✅ 使用DOM方式插入HTML（光标位置）');
        
      } else {
        // 末尾插入
        const wrapper = targetElement.ownerDocument.createElement('div');
        wrapper.style.cssText = 'margin: 10px 0;';
        wrapper.innerHTML = html;
        
        targetElement.appendChild(wrapper);
        console.log('✅ 使用DOM方式插入HTML（末尾）');
      }
      
    } catch (error) {
      console.error('DOM插入失败:', error);
      // 最后的备用方案
      try {
        const targetElement = editorType === 'ueditor-api' ? 
          (editor.body || editor.document.body) : editor;
        targetElement.insertAdjacentHTML('beforeend', `<div style="margin: 10px 0;">${html}</div>`);
        console.log('⚠️ 使用insertAdjacentHTML备用方案');
      } catch (e) {
        throw new Error('所有插入方法都失败了');
      }
    }
  }
  
  // 查找微信编辑器 - 使用更精确的识别逻辑
  let editor = null;
  let editorType = '';
  
  // 黑名单：排除这些不是主编辑器的元素
  const blacklistClasses = [
    'tips_input',
    'recommend_content', 
    'js_reprint_recommend_content',
    'original_primary_tips_input',
    'appmsg_search_input',
    'title_input',
    'digest_input'
  ];
  
  // 检查元素是否在黑名单中
  function isBlacklisted(element) {
    const className = element.className || '';
    return blacklistClasses.some(blackClass => className.includes(blackClass));
  }
  
  // 方法1: 优先使用UEditor API (最可靠)
  if (window.UE) {
    try {
      const ueInstance = window.UE.getEditor('ueditor_0');
      if (ueInstance && ueInstance.ready) {
        editor = ueInstance;
        editorType = 'ueditor-api';
        console.log('✅ 找到UEditor API实例');
      }
    } catch (e) {
      console.log('UEditor API检查失败:', e.message);
    }
  }
  
  // 方法2: 尝试UEditor iframe
  if (!editor) {
    const ueditorFrame = document.querySelector('#ueditor_0 iframe');
    if (ueditorFrame) {
      try {
        const frameDoc = ueditorFrame.contentDocument || ueditorFrame.contentWindow.document;
        const frameBody = frameDoc.body;
        if (frameBody && frameBody.isContentEditable) {
          editor = frameBody;
          editorType = 'ueditor-iframe';
          console.log('✅ 找到UEditor iframe编辑器');
        }
      } catch (e) {
        console.log('无法访问iframe内容:', e.message);
      }
    }
  }
  
  // 方法3: 查找其他编辑器元素（排除黑名单）
  if (!editor) {
    const editorSelectors = [
      '.edui-editor-body',
      '.rich_media_content',
      '#js_editor_content', 
      '.js_editor_content',
      '[data-editor="content"]',
      '.edui-body-container',
      '[contenteditable="true"]'  // 放在最后，因为范围太广
    ];
    
    for (const selector of editorSelectors) {
      const elements = document.querySelectorAll(selector);
      for (const element of elements) {
        if ((element.isContentEditable || element.contentEditable === 'true') && 
            !isBlacklisted(element)) {
          
          // 额外验证：检查是否包含文章内容
          const textContent = element.textContent || '';
          const hasRealContent = textContent.length > 10; // 真正的编辑器应该有更多内容
          
          // 对于通用的contenteditable选择器，需要更严格的验证
          if (selector === '[contenteditable="true"]') {
            // 检查是否是主要编辑区域
            const isMainEditor = hasRealContent && 
              (element.offsetHeight > 100) && // 高度足够
              (element.offsetWidth > 200);    // 宽度足够
            
            if (isMainEditor) {
              editor = element;
              editorType = selector;
              console.log('✅ 找到主编辑器:', selector);
              console.log('编辑器信息:', {
                className: element.className,
                textLength: textContent.length,
                tagName: element.tagName,
                dimensions: `${element.offsetWidth}x${element.offsetHeight}`
              });
              break;
            }
          } else {
            // 其他选择器直接使用
            editor = element;
            editorType = selector;
            console.log('✅ 找到编辑器:', selector);
            console.log('编辑器信息:', {
              className: element.className,
              textLength: textContent.length,
              tagName: element.tagName
            });
            break;
          }
        }
      }
      if (editor) break;
    }
  }
  
  // 如果还是没找到，尝试使用helper函数
  if (!editor && window.weixinHtmlPluginHelper) {
    console.log('🔍 尝试使用helper函数...');
    try {
      const helperEditor = window.weixinHtmlPluginHelper.getBestEditor();
      if (helperEditor) {
        editor = helperEditor;
        editorType = 'helper-selected';
        console.log('✅ Helper找到编辑器:', {
          className: editor.className,
          area: editor.offsetWidth * editor.offsetHeight,
          dimensions: `${editor.offsetWidth}x${editor.offsetHeight}`
        });
      }
    } catch (e) {
      console.log('Helper函数调用失败:', e.message);
    }
  }

  // 如果还是没找到，尝试放宽条件
  if (!editor) {
    console.log('🔍 放宽条件重新搜索...');
    const allEditables = document.querySelectorAll('[contenteditable="true"]');
    
    let bestEditor = null;
    let bestScore = 0;
    
    for (const element of allEditables) {
      if (!isBlacklisted(element)) {
        // 计算编辑器质量分数
        const area = element.offsetWidth * element.offsetHeight;
        const textLength = (element.textContent || '').length;
        let score = 0;
        
        score += area > 50000 ? 50 : (area / 1000); // 面积分数
        score += textLength > 100 ? 30 : (textLength / 10); // 内容分数
        score += element.offsetHeight > 200 ? 20 : 0; // 高度分数
        
        if (score > bestScore && score > 10) { // 最低分数阈值
          bestScore = score;
          bestEditor = element;
        }
      }
    }
    
    if (bestEditor) {
      editor = bestEditor;
      editorType = 'score-based-selection';
      console.log('✅ 基于分数选择编辑器:', {
        className: editor.className,
        score: bestScore.toFixed(1),
        area: editor.offsetWidth * editor.offsetHeight,
        dimensions: `${editor.offsetWidth}x${editor.offsetHeight}`
      });
    }
  }
  
  // 最终验证
  if (!editor) {
    console.error('❌ 未找到合适的微信编辑器');
    
    // 显示详细调试信息
    console.log('\n🔍 调试信息:');
    console.log('页面中的可编辑元素:');
    document.querySelectorAll('[contenteditable="true"]').forEach((el, i) => {
      const isBlocked = isBlacklisted(el);
      const area = el.offsetWidth * el.offsetHeight;
      console.log(`  ${i + 1}: ${isBlocked ? '❌ 已排除' : '✅ 可用'} - ${el.tagName}`);
      console.log(`      类名: ${el.className || '无'}`);
      console.log(`      ID: ${el.id || '无'}`);
      console.log(`      内容长度: ${(el.textContent || '').length}`);
      console.log(`      尺寸: ${el.offsetWidth}x${el.offsetHeight} (面积: ${area})`);
      console.log(`      位置: ${el.offsetTop}, ${el.offsetLeft}`);
      console.log('');
    });
    
    // 检查UEditor状态
    if (window.UE) {
      try {
        const ueInstance = window.UE.getEditor('ueditor_0');
        console.log('UEditor状态:', {
          exists: !!ueInstance,
          ready: ueInstance ? ueInstance.ready : false,
          hasBody: ueInstance ? !!ueInstance.body : false
        });
      } catch (e) {
        console.log('UEditor检查错误:', e.message);
      }
    } else {
      console.log('UEditor不可用');
    }
    
    alert('未找到合适的微信编辑器，请确保：\n\n1. 在微信公众号文章编辑页面\n2. 页面已完全加载\n3. 编辑器已激活（点击编辑区域）\n\n如果问题持续，请刷新页面重试。');
    return;
  }
  
  console.log(`🎯 使用编辑器: ${editorType}`);
  
  // 验证编辑器是否可用
  if (editorType === 'ueditor-api') {
    if (!editor.ready) {
      console.warn('⚠️ UEditor未就绪，等待初始化...');
      // 可以添加等待逻辑
    }
  }
  
  try {
    // 转换为微信兼容的HTML
    const compatibleHtml = convertHtmlForWeChat(html);
    console.log('转换后的HTML:', compatibleHtml);
    
    // 记录插入前的内容
    let beforeContent = '';
    try {
      if (editorType === 'ueditor-api') {
        beforeContent = editor.getContent() || '';
      } else {
        beforeContent = editor.textContent || editor.innerText || '';
      }
    } catch (e) {
      beforeContent = '';
    }
    
    const beforeLength = beforeContent.length;
    console.log(`📊 插入前内容长度: ${beforeLength}`);
    
    // 插入HTML
    if (position === 'cursor') {
      insertAtCursor(editor, compatibleHtml);
    } else {
      insertAtEnd(editor, compatibleHtml);
    }
    
    // 触发编辑器事件（立即触发，确保编辑器感知变化）
    triggerEditorEvents(editor);
    
    // 延迟验证插入结果
    setTimeout(() => {
      verifyInsertion(editor, beforeContent, compatibleHtml, position);
    }, 200);
    
    console.log('HTML插入成功');
    
  } catch (error) {
    console.error('插入HTML失败:', error);
    alert('插入HTML失败: ' + error.message);
  }
  
  // 触发编辑器事件
  function triggerEditorEvents(editor) {
    try {
      // 针对UEditor API的事件触发
      if (editorType === 'ueditor-api' && editor.fireEvent) {
        editor.fireEvent('contentchange');
        editor.fireEvent('selectionchange');
        console.log('✅ 触发UEditor API事件');
        return;
      }
      
      // 针对UEditor实例的事件触发
      if (window.UE && editorType.includes('ueditor')) {
        try {
          const ueInstance = window.UE.getEditor('ueditor_0');
          if (ueInstance && ueInstance.ready) {
            ueInstance.fireEvent('contentchange');
            ueInstance.fireEvent('selectionchange');
            console.log('✅ 触发UEditor实例事件');
            return;
          }
        } catch (e) {
          console.log('UEditor实例事件触发失败:', e.message);
        }
      }
      
      // DOM事件触发（备用）
      const targetElement = editorType === 'ueditor-api' ? 
        (editor.body || editor.document.body) : editor;
      
      const events = ['input', 'change', 'keyup'];
      events.forEach(eventType => {
        try {
          const event = new Event(eventType, { 
            bubbles: true, 
            cancelable: true 
          });
          targetElement.dispatchEvent(event);
        } catch (e) {
          console.log(`触发事件 ${eventType} 失败:`, e.message);
        }
      });
      
      console.log('✅ 触发DOM事件');
      
    } catch (error) {
      console.error('事件触发失败:', error);
    }
  }

  // 验证插入结果
  function verifyInsertion(editor, beforeContent, insertedHtml, position) {
    console.log('\n🔍 验证插入结果...');
    
    try {
      // 获取当前内容
      let currentContent = '';
      if (editorType === 'ueditor-api') {
        currentContent = editor.getContent() || '';
      } else {
        currentContent = editor.textContent || editor.innerText || '';
      }
      
      const currentLength = currentContent.length;
      const beforeLength = beforeContent.length;
      
      console.log(`📊 内容长度: ${beforeLength} -> ${currentLength} (变化: ${currentLength - beforeLength})`);
      
      // 检查内容是否包含插入的关键词
      const insertedText = insertedHtml.replace(/<[^>]*>/g, ''); // 移除HTML标签
      const hasKeyContent = currentContent.includes(insertedText.substring(0, 20)); // 检查前20个字符
      
      console.log(`🔍 关键内容检查: ${hasKeyContent ? '✅ 找到' : '❌ 未找到'}`);
      
      if (currentLength > beforeLength && hasKeyContent) {
        console.log('🎉 验证通过: HTML已成功插入！');
        
        // 显示成功通知
        showSuccessNotification();
        
      } else {
        console.warn('⚠️ 验证失败: 内容可能未正确插入');
        
        // 尝试强制插入
        tryAlternativeInsert(editor, insertedHtml, position);
      }
      
    } catch (error) {
      console.error('验证过程出错:', error);
      console.log('⚠️ 无法验证插入结果，但操作已执行');
    }
  }

  // 显示成功通知
  function showSuccessNotification() {
    try {
      // 创建临时成功提示
      const notification = document.createElement('div');
      notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #4caf50;
        color: white;
        padding: 12px 20px;
        border-radius: 6px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        z-index: 10000;
        font-size: 14px;
        font-family: -apple-system, BlinkMacSystemFont, sans-serif;
      `;
      notification.textContent = '✅ HTML插入成功！';
      
      document.body.appendChild(notification);
      
      // 3秒后自动移除
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 3000);
      
    } catch (e) {
      console.log('无法显示成功通知:', e);
    }
  }

  // 尝试替代插入方法
  function tryAlternativeInsert(editor, html, position) {
    console.log('🔄 尝试替代插入方法...');
    
    try {
      // 方法1: 直接操作UEditor内容
      if (editorType === 'ueditor-api') {
        const currentContent = editor.getContent();
        const newContent = position === 'end' ? 
          currentContent + '<br>' + html :
          html + '<br>' + currentContent;
        
        editor.setContent(newContent);
        console.log('✅ 使用UEditor setContent方法');
        
        // 重新触发事件
        triggerEditorEvents(editor);
        return;
      }
      
      // 方法2: innerHTML直接设置（风险较高但有效）
      const targetElement = editorType === 'ueditor-api' ? 
        (editor.body || editor.document.body) : editor;
        
      if (position === 'end') {
        const currentHtml = targetElement.innerHTML;
        targetElement.innerHTML = currentHtml + '<div style="margin: 10px 0;">' + html + '</div>';
      } else {
        const currentHtml = targetElement.innerHTML;
        targetElement.innerHTML = '<div style="margin: 10px 0;">' + html + '</div>' + currentHtml;
      }
      
      console.log('✅ 使用innerHTML直接设置');
      
      // 重新触发事件
      triggerEditorEvents(editor);
      
    } catch (error) {
      console.error('❌ 替代插入方法也失败了:', error);
    }
  }
}



// 获取HTML模板
async function getHtmlTemplates() {
  const result = await chrome.storage.sync.get(['htmlTemplates']);
  return result.htmlTemplates || getDefaultTemplates();
}

// 保存HTML模板
async function saveHtmlTemplate(templateData) {
  try {
    const { templates } = await chrome.storage.sync.get(['htmlTemplates']);
    const updatedTemplates = templates || getDefaultTemplates();
    
    updatedTemplates.push(templateData);
    
    await chrome.storage.sync.set({ htmlTemplates: updatedTemplates });
    return { success: true };
  } catch (error) {
    console.error('保存模板失败:', error);
    throw error;
  }
}

// 默认模板
function getDefaultTemplates() {
  return [
    {
      id: 'basic',
      name: '基础模板',
      html: '<div style="padding: 20px; border: 1px solid #ddd; border-radius: 8px;"><h3 style="color: #333; margin-top: 0;">标题</h3><p style="color: #666; line-height: 1.6;">这里是内容...</p></div>'
    },
    {
      id: 'highlight',
      name: '高亮框',
      html: '<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 10px; color: white; text-align: center;"><h3 style="margin: 0 0 10px 0;">重要提醒</h3><p style="margin: 0; opacity: 0.9;">这里是重要内容</p></div>'
    },
    {
      id: 'quote',
      name: '引用块',
      html: '<blockquote style="border-left: 4px solid #42b983; padding-left: 20px; margin: 20px 0; background: #f8f8f8; padding: 15px 20px; border-radius: 0 8px 8px 0;"><p style="margin: 0; font-style: italic; color: #666;">"这里是引用内容"</p></blockquote>'
    },
    {
      id: 'button',
      name: '按钮',
      html: '<div style="text-align: center; margin: 20px 0;"><a href="#" style="display: inline-block; padding: 12px 30px; background: #007cff; color: white; text-decoration: none; border-radius: 25px; font-weight: bold;">点击按钮</a></div>'
    }
  ];
} 