<template>
  <div class="page-container">
    <div class="login-container">
      <h1>登录</h1>
      <form class="login-form" @submit.prevent="handleSubmit">
        <div class="form-group">
          <label for="email">邮箱</label>
          <input 
            type="email" 
            id="email" 
            v-model="email" 
            placeholder="请输入邮箱"
            required
          />
        </div>
        <div class="form-group">
          <label for="password">密码</label>
          <div class="password-container">
            <input 
              :type="showPassword ? 'text' : 'password'"
              id="password" 
              v-model="password" 
              placeholder="请输入密码"
              required
              class="password-input"
            />
            <font-awesome-icon 
              :icon="showPassword ? 'eye-slash' : 'eye'"
              class="password-toggle"
              @click="showPassword = !showPassword"
              title="显示/隐藏密码"
            />
          </div>
        </div>
        <div class="form-group">
          <label for="captcha">验证码</label>
          <div class="captcha-container">
            <input 
              type="text" 
              id="captcha" 
              v-model="captcha" 
              placeholder="请输入验证码"
              required
              class="captcha-input"
            />
            <div class="captcha-image-container">
              <img 
                v-if="!isCaptchaLoading && captchaImageUrl"
                :src="captchaImageUrl" 
                alt="验证码"
                class="captcha-image"
                @click="refreshCaptcha"
                title="点击刷新验证码"
              />
              <div 
                v-else
                class="captcha-loading"
                @click="refreshCaptcha"
                title="点击刷新验证码"
              >
                <font-awesome-icon icon="spinner" spin />
                <span>加载中...</span>
              </div>
            </div>
          </div>
        </div>
        <button type="submit" class="login-button" :disabled="isLoading">登录</button>
        <div class="form-footer">
          <router-link to="/register" class="register-link">还没有账号？立即注册</router-link>
          <router-link to="/reset-password" class="reset-password-link">忘记密码？重置密码</router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getCaptcha, login } from '@/api'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { message } from '@/utils/message'
import { getUserId } from '@/utils/fingerprint'
import { passHash } from '@/utils/crypto'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const email = ref('')
const password = ref('')
const captcha = ref('')
const captchaImageUrl = ref('')
const captchaNonce = ref('')
const isLoading = ref(false)
const isCaptchaLoading = ref(true)
const showPassword = ref(false)

// 获取验证码
const loadCaptcha = async () => {
  isCaptchaLoading.value = true
  try {
    const { imageUrl, nonce } = await getCaptcha()
    captchaImageUrl.value = imageUrl
    captchaNonce.value = nonce
  } catch (error) {
    console.error('获取验证码失败:', error)
    message.error('获取验证码失败，请刷新页面重试')
  } finally {
    isCaptchaLoading.value = false
  }
}

// 刷新验证码
const refreshCaptcha = () => {
  loadCaptcha()
}

const handleSubmit = async () => {
  if (!captcha.value) {
    message.error('请输入验证码')
    return
  }
  
  if (isLoading.value) return
  
  isLoading.value = true
  
  try {
    const result = await login({
      email: email.value,
      pass: passHash(password.value),
      code: captcha.value,
      nonce: captchaNonce.value
    })
    
    // 处理登录成功
    if (result.user_login_info) {
      userStore.setUserInfo(result.user_login_info)
      message.success('登录成功')
      
      // 检查是否为SSO登录
      if (route.query.type === 'sso' && route.query.redirect) {
        // SSO登录成功，跳转到SSO页面
        router.push({
          path: '/user/sso',
          query: {
            app: 'ccxc',
            token: getUserId(),
            redirect: route.query.redirect
          }
        })
      } else {
        // 普通登录，跳转到首页
        router.push('/')
      }
    }
  } catch (error) {
    console.error('登录失败:', error)
    
    // 检查是否为用户未激活状态
    if (error.response?.data?.status === 31) {
      message.warning('用户未激活，正在跳转到激活页面')
      router.push({
        name: 'Activate',
        query: { email: email.value }
      })
      return
    }
    
    // 登录失败后刷新验证码
    refreshCaptcha()
    captcha.value = ''
  } finally {
    isLoading.value = false
  }
}

// 组件挂载时加载验证码
onMounted(() => {
  loadCaptcha()
})
</script>

<style scoped>
.page-container {
  min-height: calc(100vh - 120px);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
}

.login-container {
  background: rgba(255, 255, 255, 0.05);
  padding: 3rem;
  border-radius: 15px;
  border: 1px solid rgba(100, 255, 218, 0.2);
  width: 100%;
  max-width: 400px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
}

h1 {
  color: #64ffda;
  text-align: center;
  margin-bottom: 2rem;
  font-size: 2rem;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

label {
  color: #ffffff;
  font-size: 0.9rem;
}

input {
  padding: 0.8rem;
  border: 1px solid rgba(100, 255, 218, 0.3);
  border-radius: 5px;
  background: rgba(255, 255, 255, 0.1);
  color: #ffffff;
  font-size: 1rem;
}

input:focus {
  outline: none;
  border-color: #64ffda;
  box-shadow: 0 0 0 2px rgba(100, 255, 218, 0.2);
}

input::placeholder {
  color: #888888;
}

.login-button {
  padding: 1rem;
  background: linear-gradient(45deg, #64ffda, #00bcd4);
  color: #1a1a1a;
  border: none;
  border-radius: 5px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.login-button:hover {
  background: linear-gradient(45deg, #4dd0e1, #64ffda);
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(100, 255, 218, 0.4);
}

.login-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.form-footer {
  text-align: center;
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.register-link {
  color: #64ffda;
  text-decoration: none;
  font-size: 0.9rem;
}

.register-link:hover {
  text-decoration: underline;
}

.reset-password-link {
  color: #64ffda;
  text-decoration: none;
  font-size: 0.9rem;
}

.reset-password-link:hover {
  text-decoration: underline;
}

.captcha-container {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.captcha-input {
  flex: 1;
  width: 170px;
}

.captcha-image-container {
  width: 120px;
  height: 50px;
}

.captcha-image {
  width: 100%;
  height: 100%;
  border: 1px solid rgba(100, 255, 218, 0.3);
  border-radius: 5px;
  cursor: pointer;
  transition: border-color 0.3s ease;
}

.captcha-image:hover {
  border-color: #64ffda;
}

.captcha-loading {
  width: 100%;
  height: 100%;
  border: 1px solid rgba(100, 255, 218, 0.3);
  border-radius: 5px;
  cursor: pointer;
  transition: border-color 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.05);
  color: #64ffda;
  font-size: 0.8rem;
}

.captcha-loading:hover {
  border-color: #64ffda;
}

.captcha-loading i {
  font-size: 1.2rem;
  margin-bottom: 0.2rem;
}

.captcha-loading span {
  font-size: 0.7rem;
}

.password-container {
  position: relative;
  display: flex;
  align-items: center;
}

.password-input {
  flex: 1;
  padding-right: 2.5rem;
}

.password-toggle {
  position: absolute;
  right: 0.8rem;
  color: #888888;
  cursor: pointer;
  transition: color 0.3s ease;
  font-size: 1rem;
}

.password-toggle:hover {
  color: #64ffda;
}
</style> 