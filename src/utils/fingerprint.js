/**
 * 浏览器指纹工具函数
 */

import CryptoJS from 'crypto-js'

/**
 * 获取 Canvas 指纹
 * @returns {string} Canvas 指纹字符串
 */
function getCanvasFingerprint() {
  try {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    
    // 设置canvas尺寸
    canvas.width = 200
    canvas.height = 50
    
    // 绘制一些图形和文本
    ctx.textBaseline = 'top'
    ctx.font = '14px Arial'
    ctx.fillStyle = '#f60'
    ctx.fillRect(125, 1, 62, 20)
    
    ctx.fillStyle = '#069'
    ctx.fillText('Hello, World! 🌍', 2, 15)
    
    ctx.fillStyle = 'rgba(102, 204, 0, 0.7)'
    ctx.fillText('CCXC Fingerprint', 4, 30)
    
    return canvas.toDataURL()
  } catch (e) {
    return 'canvas_error'
  }
}

/**
 * 获取 WebGL 指纹
 * @returns {object} WebGL 指纹信息
 */
function getWebGLFingerprint() {
  try {
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
    
    if (!gl) {
      return { error: 'webgl_not_supported' }
    }
    
    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info')
    
    return {
      vendor: gl.getParameter(gl.VENDOR),
      renderer: gl.getParameter(gl.RENDERER),
      version: gl.getParameter(gl.VERSION),
      shadingLanguageVersion: gl.getParameter(gl.SHADING_LANGUAGE_VERSION),
      unmaskedVendor: debugInfo ? gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) : null,
      unmaskedRenderer: debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : null
    }
  } catch (e) {
    return { error: 'webgl_error' }
  }
}

/**
 * 获取已安装的字体列表
 * @returns {array} 字体列表
 */
function getFontList() {
  const testFonts = [
    'Arial', 'Arial Black', 'Comic Sans MS', 'Courier New', 'Georgia', 'Helvetica',
    'Impact', 'Lucida Console', 'Lucida Sans Unicode', 'Palatino Linotype',
    'Tahoma', 'Times New Roman', 'Trebuchet MS', 'Verdana', 'Times',
    'Monaco', 'Menlo', 'Consolas', 'Inconsolata', 'Source Code Pro',
    'Microsoft YaHei', 'SimSun', 'SimHei', 'KaiTi', 'FangSong'
  ]
  
  const detectedFonts = []
  const testString = 'mmmmmmmmmmlli'
  const testSize = '72px'
  
  // 创建测试元素
  const testElement = document.createElement('span')
  testElement.style.fontSize = testSize
  testElement.style.position = 'absolute'
  testElement.style.left = '-9999px'
  testElement.style.top = '-9999px'
  testElement.style.visibility = 'hidden'
  testElement.innerHTML = testString
  document.body.appendChild(testElement)
  
  // 获取默认字体的尺寸
  testElement.style.fontFamily = 'monospace'
  const defaultWidth = testElement.offsetWidth
  const defaultHeight = testElement.offsetHeight
  
  // 测试每个字体
  testFonts.forEach(font => {
    testElement.style.fontFamily = `${font}, monospace`
    if (testElement.offsetWidth !== defaultWidth || testElement.offsetHeight !== defaultHeight) {
      detectedFonts.push(font)
    }
  })
  
  document.body.removeChild(testElement)
  return detectedFonts
}

/**
 * 获取浏览器插件信息
 * @returns {array} 插件信息列表
 */
function getPluginList() {
  if (!navigator.plugins) {
    return []
  }
  
  const plugins = []
  for (let i = 0; i < navigator.plugins.length; i++) {
    const plugin = navigator.plugins[i]
    plugins.push({
      name: plugin.name,
      description: plugin.description,
      filename: plugin.filename,
      version: plugin.version
    })
  }
  
  return plugins.sort((a, b) => a.name.localeCompare(b.name))
}

/**
 * 获取浏览器指纹信息
 * @returns {object} 浏览器指纹信息对象
 */
function getBrowserFingerprint() {
  const fingerprint = {
    // 基本信息
    userAgent: navigator.userAgent,
    language: navigator.language,
    languages: navigator.languages || [],
    platform: navigator.platform,
    hardwareConcurrency: navigator.hardwareConcurrency || 0,
    deviceMemory: navigator.deviceMemory || 0,
    
    // 屏幕信息
    screen: {
      width: screen.width,
      height: screen.height,
      availWidth: screen.availWidth,
      availHeight: screen.availHeight,
      colorDepth: screen.colorDepth,
      pixelDepth: screen.pixelDepth
    },
    
    // 时区信息
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    timezoneOffset: new Date().getTimezoneOffset(),
    
    // 窗口信息
    viewport: {
      width: window.innerWidth,
      height: window.innerHeight,
      outerWidth: window.outerWidth,
      outerHeight: window.outerHeight
    },
    
    // 特性检测
    features: {
      cookieEnabled: navigator.cookieEnabled,
      doNotTrack: navigator.doNotTrack,
      onLine: navigator.onLine,
      javaEnabled: typeof navigator.javaEnabled === 'function' ? navigator.javaEnabled() : false,
      webdriver: navigator.webdriver || false,
      localStorage: typeof Storage !== 'undefined',
      sessionStorage: typeof Storage !== 'undefined',
      indexedDB: typeof indexedDB !== 'undefined',
      webGL: typeof WebGLRenderingContext !== 'undefined',
      canvas: typeof CanvasRenderingContext2D !== 'undefined'
    },
    
    // Canvas 指纹
    canvasFingerprint: getCanvasFingerprint(),
    
    // WebGL 指纹
    webglFingerprint: getWebGLFingerprint(),
    
    // 字体列表
    fonts: getFontList(),
    
    // 插件列表
    plugins: getPluginList()
  }
  
  return fingerprint
}

/**
 * 使用 SHA-256 算法生成哈希值
 * @param {string} message 要哈希的消息
 * @returns {string} 哈希值
 */
function sha256(message) {
  return CryptoJS.SHA256(message).toString(CryptoJS.enc.Hex)
}

/**
 * 获取用户唯一标识符
 * @returns {string} 用户ID
 */
export function getUserId() {
  try {
    // 获取浏览器指纹
    const fingerprint = getBrowserFingerprint()
    
    // 转换为 JSON 字符串
    const fingerprintJson = JSON.stringify(fingerprint, null, 2)
    
    // 生成 SHA-256 哈希
    const userId = sha256(fingerprintJson)
    
    return userId
  } catch (error) {
    console.error('获取用户ID失败:', error)
    // 如果获取失败，返回一个基于当前时间的临时ID
    const fallbackId = sha256(`fallback_${Date.now()}_${Math.random()}`)
    return fallbackId
  }
}

export default {
  getUserId,
  getBrowserFingerprint,
  sha256
} 