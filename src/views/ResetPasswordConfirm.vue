<template>
  <div class="page-container">
    <div class="reset-confirm-container">
      <!-- 验证token阶段 -->
      <div v-if="isVerifying" class="verifying-container">
        <font-awesome-icon icon="spinner" spin class="loading-icon" />
        <h2>正在验证重置链接...</h2>
      </div>
      
      <!-- 重置密码表单 -->
      <div v-else-if="isTokenValid" class="reset-form-container">
        <h1>重置密码</h1>
        <p class="email-info">正在为 <strong>{{ userEmail }}</strong> 重置密码</p>
        
        <form class="reset-form" @submit.prevent="handleSubmit">
          <div class="form-group">
            <label for="password">新密码</label>
            <div class="password-container">
              <input 
                :type="showPassword ? 'text' : 'password'"
                id="password" 
                v-model="password" 
                placeholder="请输入新密码"
                required
                minlength="6"
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
            <label for="confirmPassword">重复输入新密码</label>
            <div class="password-container">
              <input 
                :type="showConfirmPassword ? 'text' : 'password'"
                id="confirmPassword" 
                v-model="confirmPassword" 
                placeholder="请重复输入新密码"
                required
                minlength="6"
                class="password-input"
              />
              <font-awesome-icon 
                :icon="showConfirmPassword ? 'eye-slash' : 'eye'"
                class="password-toggle"
                @click="showConfirmPassword = !showConfirmPassword"
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
          
          <button type="submit" class="reset-button" :disabled="isLoading">
            {{ isLoading ? '重置中...' : '确认重置密码' }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getCaptcha, checkResetPasswordToken, resetPassword } from '@/api'
import { message } from '@/utils/message'
import { passHash } from '@/utils/crypto'

const route = useRoute()
const router = useRouter()

const isVerifying = ref(true)
const isTokenValid = ref(false)
const userEmail = ref('')
const token = ref('')
const password = ref('')
const confirmPassword = ref('')
const captcha = ref('')
const captchaImageUrl = ref('')
const captchaNonce = ref('')
const isLoading = ref(false)
const isCaptchaLoading = ref(true)
const showPassword = ref(false)
const showConfirmPassword = ref(false)

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

// 验证token
const verifyToken = async () => {
  const tokenParam = route.query.token
  if (!tokenParam) {
    router.push({
      name: 'MessagePage',
      query: {
        type: 'error',
        message: '缺少重置密码令牌，请重新申请重置密码'
      }
    })
    return
  }

  token.value = tokenParam
  
  try {
    const result = await checkResetPasswordToken(tokenParam)
    if (result.email) {
      userEmail.value = result.email
      isTokenValid.value = true
      isVerifying.value = false
      // 验证成功后加载验证码
      await loadCaptcha()
    } else {
      throw new Error('无效的响应格式')
    }
  } catch (error) {
    console.error('验证token失败:', error)
    router.push({
      name: 'MessagePage',
      query: {
        type: 'error',
        message: error.response?.data?.message || '重置密码链接无效或已过期，请重新申请重置密码'
      }
    })
  }
}

// 提交重置密码
const handleSubmit = async () => {
  // 验证密码
  if (password.value.length < 6) {
    message.error('密码长度至少为6位')
    return
  }
  
  if (password.value !== confirmPassword.value) {
    message.error('两次输入的密码不一致')
    return
  }
  
  if (!captcha.value) {
    message.error('请输入验证码')
    return
  }
  
  if (isLoading.value) return
  
  isLoading.value = true
  
  try {
    await resetPassword({
      token: token.value,
      pass: passHash(password.value),
      code: captcha.value,
      nonce: captchaNonce.value
    })
    
    message.success('密码重置成功，请使用新密码登录')
    
    // 延迟跳转到登录页
    setTimeout(() => {
      router.push('/login')
    }, 2000)
    
  } catch (error) {
    console.error('重置密码失败:', error)
    message.error(error.response?.data?.message || '重置密码失败，请重试')
    
    // 失败后刷新验证码
    refreshCaptcha()
    captcha.value = ''
  } finally {
    isLoading.value = false
  }
}

// 组件挂载时验证token
onMounted(() => {
  verifyToken()
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

.reset-confirm-container {
  background: rgba(255, 255, 255, 0.05);
  padding: 3rem;
  border-radius: 15px;
  border: 1px solid rgba(100, 255, 218, 0.2);
  width: 100%;
  max-width: 450px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
}

.verifying-container {
  text-align: center;
  color: #ffffff;
}

.loading-icon {
  font-size: 2rem;
  color: #64ffda;
  margin-bottom: 1rem;
}

.verifying-container h2 {
  color: #64ffda;
  margin: 0;
}

h1 {
  color: #64ffda;
  text-align: center;
  margin-bottom: 1rem;
  font-size: 2rem;
}

.email-info {
  text-align: center;
  color: #ffffff;
  margin-bottom: 2rem;
  font-size: 1rem;
}

.email-info strong {
  color: #64ffda;
}

.reset-form {
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

.captcha-container {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.captcha-input {
  flex: 1;
  width: 200px;
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

.reset-button {
  padding: 1rem;
  background: linear-gradient(45deg, #64ffda, #00bcd4);
  color: #1a1a1a;
  border: none;
  border-radius: 5px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 1rem;
}

.reset-button:hover:not(:disabled) {
  background: linear-gradient(45deg, #4dd0e1, #64ffda);
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(100, 255, 218, 0.4);
}

.reset-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}
</style> 