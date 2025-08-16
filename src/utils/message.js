// 简单的消息提示实现
class MessageUtil {
  constructor() {
    this.container = null
    this.initContainer()
  }

  initContainer() {
    this.container = document.createElement('div')
    this.container.id = 'message-container'
    this.container.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 9999;
      pointer-events: none;
    `
    document.body.appendChild(this.container)
  }

  show(content, type = 'info', duration = 3000) {
    const messageEl = document.createElement('div')
    messageEl.style.cssText = `
      padding: 12px 16px;
      margin-bottom: 8px;
      border-radius: 6px;
      color: white;
      font-size: 14px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      animation: slideInRight 0.3s ease;
      pointer-events: auto;
      max-width: 300px;
      word-wrap: break-word;
    `

    // 根据类型设置背景色
    const typeColors = {
      success: '#52c41a',
      error: '#ff4d4f',
      warning: '#faad14',
      info: '#1890ff'
    }
    messageEl.style.backgroundColor = typeColors[type] || typeColors.info
    messageEl.textContent = content

    // 添加滑入动画
    const style = document.createElement('style')
    style.textContent = `
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
    `
    if (!document.getElementById('message-styles')) {
      style.id = 'message-styles'
      document.head.appendChild(style)
    }

    this.container.appendChild(messageEl)

    // 自动移除
    setTimeout(() => {
      messageEl.style.animation = 'slideOutRight 0.3s ease'
      setTimeout(() => {
        if (messageEl.parentNode) {
          messageEl.parentNode.removeChild(messageEl)
        }
      }, 300)
    }, duration)
  }

  success(content, duration) {
    this.show(content, 'success', duration)
  }

  error(content, duration) {
    this.show(content, 'error', duration)
  }

  warning(content, duration) {
    this.show(content, 'warning', duration)
  }

  info(content, duration) {
    this.show(content, 'info', duration)
  }
}

export const message = new MessageUtil() 