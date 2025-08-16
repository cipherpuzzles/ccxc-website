<template>
  <div class="sso-container">
    <div class="sso-card">
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>正在处理SSO请求...</p>
      </div>
      
      <div v-else-if="error" class="error-state">
        <div class="error-icon">⚠️</div>
        <h2>SSO参数错误</h2>
        <p>{{ error }}</p>
        <p>请返回原网站重试。</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ssoCheck, ssoLogin } from '@/api'
import { getUserId } from '@/utils/fingerprint'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const loading = ref(true)
const error = ref('')

// URL参数
const app = ref('')
const token = ref('')
const redirect = ref('')

onMounted(() => {
  initSSO()
})

const initSSO = async () => {
  try {
    // 获取URL参数
    app.value = route.query.app || ''
    token.value = route.query.token || ''
    redirect.value = route.query.redirect || ''

    // 检查必需参数
    if (!app.value || !token.value || !redirect.value) {
      error.value = 'SSO参数错误，缺少必需的参数'
      loading.value = false
      return
    }

    // 第一步：检查SSO请求是否有效
    await checkSSO()
  } catch (err) {
    console.error('SSO初始化失败:', err)
    error.value = 'SSO初始化失败'
    loading.value = false
  }
}

const checkSSO = async () => {
  try {
    // 调用 /v1/sso-check 接口
    await ssoCheck({
      token: app.value,
      callback_url: redirect.value
    })

    // SSO检查成功，继续处理登录
    await handleLoginFlow()
  } catch (err) {
    // SSO检查失败，重定向到原站点
    const errorMessage = err.response?.data?.message || '未知错误'
    redirectWithError('0701', errorMessage)
  }
}

const handleLoginFlow = async () => {
  try {
    // 检查用户是否已登录
    if (userStore.isLoggedIn()) {
      // 用户已登录，进行SSO登录
      await performSSOLogin()
    } else {
      // 用户未登录，跳转到登录页面
      router.push({
        path: '/login',
        query: {
          type: 'sso',
          redirect: redirect.value
        }
      })
    }
  } catch (err) {
    console.error('处理登录流程失败:', err)
    error.value = '处理登录流程失败'
    loading.value = false
  }
}

const performSSOLogin = async () => {
  try {
    // 调用 /v1/sso-login 接口
    await ssoLogin({
      userid: token.value
    })

    // SSO登录成功，重定向到目标站点
    redirectWithSuccess()
  } catch (err) {
    // SSO登录失败，重定向到原站点
    const errorMessage = err.response?.data?.message || '未知错误'
    redirectWithError('0702', errorMessage)
  }
}

const redirectWithError = (code, message) => {
  const url = new URL(redirect.value)
  url.searchParams.set('result', 'failed')
  url.searchParams.set('code', code)
  url.searchParams.set('message', message)
  
  window.location.href = url.toString()
}

const redirectWithSuccess = () => {
  const url = new URL(redirect.value)
  url.searchParams.set('result', 'ok')
  url.searchParams.set('uid', userStore.uid)
  url.searchParams.set('username', userStore.username)
  url.searchParams.set('roleid', userStore.roleid.toString())
  url.searchParams.set('token', userStore.token)
  url.searchParams.set('sk', userStore.sk)
  url.searchParams.set('etc', userStore.etc)
  url.searchParams.set('color', userStore.color)
  
  window.location.href = url.toString()
}
</script>

<style scoped>
.sso-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  background: #0d1117;
}

.sso-card {
  background: rgba(255, 255, 255, 0.05);
  padding: 3rem;
  border-radius: 15px;
  border: 1px solid rgba(100, 255, 218, 0.2);
  max-width: 500px;
  text-align: center;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
}

.loading-state {
  color: #ffffff;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(100, 255, 218, 0.2);
  border-top: 4px solid #64ffda;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-state p {
  font-size: 1.1rem;
  margin: 0;
}

.error-state {
  color: #ffffff;
}

.error-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.error-state h2 {
  color: #ff6b6b;
  margin: 1rem 0;
  font-size: 1.5rem;
}

.error-state p {
  margin: 0.5rem 0;
  line-height: 1.6;
  color: #cccccc;
}
</style> 