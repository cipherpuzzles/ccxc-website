import { marked } from 'marked'

/**
 * 渲染markdown内容为HTML
 * @param {string} markdown markdown字符串
 * @returns {string} 渲染后的HTML字符串
 */
export function renderMarkdown(markdown) {
  if (!markdown) return ''
  
  // 配置marked选项
  marked.setOptions({
    breaks: true, // 支持软换行
    gfm: true,    // 启用GitHub风格的markdown
    sanitize: false // 如果需要防XSS，可以设置为true或使用DOMPurify
  })
  
  return marked.parse(markdown)
} 