<template>
  <div class="page-container">
    <div class="change-password-container">
      <h1>修改密码</h1>
      <form class="change-password-form" @submit.prevent="handleSubmit">
        <div class="form-group">
          <label for="oldPassword">原密码</label>
          <div class="password-container">
            <input 
              :type="showOldPassword ? 'text' : 'password'"
              id="oldPassword" 
              v-model="oldPassword" 
              placeholder="请输入原密码"
              required
              class="password-input"
            />
            <font-awesome-icon 
              :icon="showOldPassword ? 'eye-slash' : 'eye'"
              class="password-toggle"
              @click="showOldPassword = !showOldPassword"
              title="显示/隐藏密码"
            />
          </div>
        </div>
        
        <div class="form-group">
          <label for="newPassword">新密码</label>
          <div class="password-container">
            <input 
              :type="showNewPassword ? 'text' : 'password'"
              id="newPassword" 
              v-model="newPassword" 
              placeholder="请输入新密码"
              required
              class="password-input"
            />
            <font-awesome-icon 
              :icon="showNewPassword ? 'eye-slash' : 'eye'"
              class="password-toggle"
              @click="showNewPassword = !showNewPassword"
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
              placeholder="请再次输入新密码"
              required
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
        
        <button type="submit" class="submit-button" :disabled="isLoading">
          {{ isLoading ? '修改中...' : '修改密码' }}
        </button>
        
        <div class="form-footer">
          <router-link to="/" class="back-link">返回首页</router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { getCaptcha } from '@/api'
import request from '@/utils/request'
import { message } from '@/utils/message'
import { getUserId } from '@/utils/fingerprint'
import { passHash } from '@/utils/crypto'

const router = useRouter()
const userStore = useUserStore()

// 检查登录状态
if (!userStore.isLoggedIn()) {
  message.error('请先登录')
  router.push('/login')
}

const oldPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const captcha = ref('')
const captchaImageUrl = ref('')
const captchaNonce = ref('')
const isLoading = ref(false)
const isCaptchaLoading = ref(true)
const showOldPassword = ref(false)
const showNewPassword = ref(false)
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
  captcha.value = ''
  loadCaptcha()
}

// 表单验证
const validateForm = () => {
  if (!oldPassword.value.trim()) {
    message.error('请输入原密码')
    return false
  }
  
  if (!newPassword.value.trim()) {
    message.error('请输入新密码')
    return false
  }
  
  if (newPassword.value.length < 6) {
    message.error('新密码至少需要6个字符')
    return false
  }
  
  if (newPassword.value === oldPassword.value) {
    message.error('新密码不能与原密码相同')
    return false
  }
  
  if (newPassword.value !== confirmPassword.value) {
    message.error('两次输入的新密码不一致')
    return false
  }
  
  if (!captcha.value.trim()) {
    message.error('请输入验证码')
    return false
  }
  
  return true
}

// 提交表单
const handleSubmit = async () => {
  if (!validateForm()) {
    return
  }
  
  if (isLoading.value) return
  
  isLoading.value = true
  
  try {
    await request({
      url: '/v1/modify-password',
      method: 'post',
      data: {
        old_pass: passHash(oldPassword.value),
        pass: passHash(newPassword.value),
        code: captcha.value,
        nonce: captchaNonce.value,
        userid: getUserId()
      }
    })
    
    message.success('密码修改成功，请重新登录')
    // 清除用户信息，跳转到登录页
    userStore.clearUserInfo()
    router.push('/login')
    
  } catch (error) {
    console.error('修改密码失败:', error)
    // 修改失败后刷新验证码
    refreshCaptcha()
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

.change-password-container {
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

.change-password-form {
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

.submit-button {
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

.submit-button:hover:not(:disabled) {
  background: linear-gradient(45deg, #4dd0e1, #64ffda);
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(100, 255, 218, 0.4);
}

.submit-button:disabled {
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