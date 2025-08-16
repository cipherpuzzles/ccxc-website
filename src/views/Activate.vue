<template>
  <div class="page-container">
    <div class="activate-container">
      <h1>邮箱激活</h1>
      <div class="activate-info">
        <div class="email-display">
          <font-awesome-icon icon="envelope" class="email-icon" />
          <span>{{ userEmail }}</span>
        </div>
        <p class="info-text">您的邮箱尚未激活，请点击下方按钮发送激活邮件</p>
      </div>
      
      <form class="activate-form" @submit.prevent="handleActivate">
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
        
        <button 
          type="submit" 
          class="activate-button" 
          :disabled="isLoading || countdown > 0"
        >
          {{ buttonText }}
        </button>
        
        <div class="form-footer">
          <router-link to="/login" class="back-link">返回登录</router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getCaptcha, sendActivationEmail } from '@/api'
import { message } from '@/utils/message'

const route = useRoute()
const router = useRouter()
const userEmail = ref('')
const captcha = ref('')
const captchaImageUrl = ref('')
const captchaNonce = ref('')
const isLoading = ref(false)
const isCaptchaLoading = ref(true)
const countdown = ref(0)
let countdownTimer = null

// 按钮文本计算属性
const buttonText = computed(() => {
  if (isLoading.value) {
    return '发送中...'
  }
  if (countdown.value > 0) {
    return `等待 ${countdown.value} 秒后重试`
  }
  return '发送激活邮件'
})

// 获取验证码
const loadCaptcha = async () => {
  isCaptchaLoading.value = true
  try {
    const { imageUrl, nonce } = await getCaptcha()
    captchaImageUrl.value = imageUrl
    captchaNonce.value = nonce
  } catch (error) {
    console.error('获取验证码失败:', error)
  } finally {
    isCaptchaLoading.value = false
  }
}

// 刷新验证码
const refreshCaptcha = () => {
  loadCaptcha()
}

// 开始倒计时
const startCountdown = () => {
  countdown.value = 60
  countdownTimer = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      clearInterval(countdownTimer)
      countdownTimer = null
    }
  }, 1000)
}

// 处理激活请求
const handleActivate = async () => {
  if (!captcha.value) {
    message.error('请输入验证码')
    return
  }
  
  if (isLoading.value || countdown.value > 0) return
  
  isLoading.value = true
  
  try {
    await sendActivationEmail({
      email: userEmail.value,
      code: captcha.value,
      nonce: captchaNonce.value
    })
    
    message.success('激活邮件已发送，请查收邮件并点击激活链接')
    startCountdown()
    captcha.value = ''
    refreshCaptcha()
  } catch (error) {
    console.error('发送激活邮件失败:', error)
    refreshCaptcha()
    captcha.value = ''
  } finally {
    isLoading.value = false
  }
}

// 组件挂载时初始化
onMounted(() => {
  userEmail.value = route.query.email || ''
  if (!userEmail.value) {
    message.error('缺少邮箱信息')
    router.push('/login')
    return
  }
  loadCaptcha()
})

// 组件卸载时清理定时器
onUnmounted(() => {
  if (countdownTimer) {
    clearInterval(countdownTimer)
  }
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

.activate-container {
  background: rgba(255, 255, 255, 0.05);
  padding: 3rem;
  border-radius: 15px;
  border: 1px solid rgba(100, 255, 218, 0.2);
  width: 100%;
  max-width: 450px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
}

h1 {
  color: #64ffda;
  text-align: center;
  margin-bottom: 2rem;
  font-size: 2rem;
}

.activate-info {
  text-align: center;
  margin-bottom: 2rem;
}

.email-display {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  padding: 1rem;
  background: rgba(100, 255, 218, 0.1);
  border-radius: 8px;
  border: 1px solid rgba(100, 255, 218, 0.2);
}

.email-icon {
  color: #64ffda;
  font-size: 1.2rem;
}

.email-display span {
  color: #ffffff;
  font-size: 1.1rem;
  font-weight: 500;
}

.info-text {
  color: #cccccc;
  margin: 0;
  line-height: 1.5;
}

.activate-form {
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

.activate-button {
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

.activate-button:hover:not(:disabled) {
  background: linear-gradient(45deg, #4dd0e1, #64ffda);
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(100, 255, 218, 0.4);
}

.activate-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.form-footer {
  text-align: center;
  margin-top: 1rem;
}

.back-link {
  color: #64ffda;
  text-decoration: none;
  font-size: 0.9rem;
}

.back-link:hover {
  text-decoration: underline;
}
</style> 