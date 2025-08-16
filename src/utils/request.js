import axios from 'axios'
import { message } from './message'
import CryptoJS from 'crypto-js'
import { useUserStore } from '@/stores/user'
import router from '@/router'

// 生成签名
function generateSign(token, sk, ts, data) {
  const dataBody = JSON.stringify(data)
  const unsignedString = `token=${token}&ts=${ts}&bodyString=${dataBody}`
  return CryptoJS.HmacSHA1(unsignedString, sk).toString(CryptoJS.enc.Base64)
}

// 处理响应状态
export function handleResponseStatus(data) {
  const { status, message: msg, location } = data
  
  switch (status) {
    case 0:
    case 1:
      return data
    case 2:
      message.error(msg)
      return Promise.reject(new Error(msg))
    case 3:
      message.warning(msg)
      router.push(location)
      return Promise.reject(new Error(msg))
    case 4:
    case 13:
      const userStore = useUserStore()
      userStore.clearUserInfo()
      router.push({
        path: '/message',
        query: {
          type: 'info',
          title: '账户状态发生变化',
          content: msg || '您的账户状态发生变化，请重新登录'
        }
      })
      return Promise.reject(new Error(msg))
    case 31:
      // 用户未激活状态，不在这里处理，交给调用方处理
      const error = new Error(msg || '用户未激活')
      error.response = { data }
      return Promise.reject(error)
    default:
      message.error(msg || '未知错误')
      return Promise.reject(new Error(msg || '未知错误'))
  }
}

// 创建请求实例
const request = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_ROOT,
  timeout: 15000,
  method: 'post',
  headers: {
    'Content-Type': 'application/json',
  },
})

// 请求拦截器
request.interceptors.request.use(
  (config) => {
    const userStore = useUserStore()
    
    // 只有在用户登录时才添加认证头部
    if (userStore.isLoggedIn()) {
      const { token, sk } = userStore
      const ts = Date.now()
      const sign = generateSign(token, sk, ts, config.data || {})
      
      config.headers['User-Token'] = token
      config.headers['X-Auth-Token'] = `Ccxc-Auth ${ts} ${sign}`
    }
    
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  (response) => {
    return handleResponseStatus(response.data)
  },
  (error) => {
    if (error.response) {
      const { data } = error.response
      // 服务器返回了错误状态码的响应
      if (data) {
        return handleResponseStatus(data)
      } else {
        message.error(`服务器错误 (${error.response.status})`)
        return Promise.reject(new Error(`服务器错误 (${error.response.status})`))
      }
    } else if (error.request) {
      // 请求已发出，但没有收到响应
      message.error('服务器无响应')
      return Promise.reject(new Error('服务器无响应'))
    } else {
      // 请求配置出错
      message.error('请求配置错误')
      return Promise.reject(new Error('请求配置错误'))
    }
  }
)

export default request 