import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUserStore = defineStore('user', () => {
  const uid = ref('')
  const username = ref('')
  const roleid = ref(0)
  const token = ref('')
  const sk = ref('')
  const etc = ref('')
  const color = ref('')
  
  // 设置用户信息
  const setUserInfo = (userInfo) => {
    uid.value = userInfo.uid || ''
    username.value = userInfo.username || ''
    roleid.value = userInfo.roleid || 0
    token.value = userInfo.token || ''
    sk.value = userInfo.sk || ''
    etc.value = userInfo.etc || ''
    color.value = userInfo.color || ''
  }
  
  // 清除用户信息
  const clearUserInfo = () => {
    uid.value = ''
    username.value = ''
    roleid.value = 0
    token.value = ''
    sk.value = ''
    etc.value = ''
    color.value = ''
  }
  
  // 检查是否已登录
  const isLoggedIn = () => {
    return !!(token.value && sk.value)
  }
  
  return {
    uid,
    username,
    roleid,
    token,
    sk,
    etc,
    color,
    setUserInfo,
    clearUserInfo,
    isLoggedIn
  }
}, {
  persist: {
    key: 'ccxc-user-store',
    storage: localStorage,
    paths: ['uid', 'username', 'roleid', 'token', 'sk', 'etc', 'color']
  }
}) 