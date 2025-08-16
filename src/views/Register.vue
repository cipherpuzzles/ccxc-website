<template>
  <div class="page-container">
    <div class="register-container">
      <h1>注册</h1>
      <form class="register-form" @submit.prevent="handleSubmit">
        <div class="form-group">
          <label for="username">用户名</label>
          <input 
            type="text" 
            id="username" 
            v-model="username" 
            placeholder="请输入用户名"
            required
          />
        </div>
        <div class="form-group">
          <label for="email">邮箱</label>
          <input 
            type="email" 
            id="email" 
            v-model="email" 
            placeholder="请输入邮箱地址"
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
          <label for="confirmPassword">确认密码</label>
          <div class="password-container">
            <input 
              :type="showConfirmPassword ? 'text' : 'password'"
              id="confirmPassword" 
              v-model="confirmPassword" 
              placeholder="请再次输入密码"
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
        <div class="form-group">
          <div class="agreement-container">
            <input 
              type="checkbox" 
              id="agreement" 
              v-model="agreeToTerms" 
              required
              class="agreement-checkbox"
            />
            <label for="agreement" class="agreement-label">
              我已阅读并同意
              <a href="/info/userterms" target="_blank" class="agreement-link">《用户协议》</a>
              和
              <a href="/info/privacypolicy" target="_blank" class="agreement-link">《隐私政策》</a>
            </label>
          </div>
        </div>
        <button type="submit" class="register-button" :disabled="isLoading || !agreeToTerms">注册</button>
        <div class="form-footer">
          <router-link to="/login" class="login-link">已有账号？立即登录</router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getCaptcha, register } from '@/api'
import { useRouter } from 'vue-router'
import { message } from '@/utils/message'
import { getUserId } from '@/utils/fingerprint'
import { passHash } from '@/utils/crypto'

const router = useRouter()
const username = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const captcha = ref('')
const captchaImageUrl = ref('')
const captchaNonce = ref('')
const isLoading = ref(false)
const isCaptchaLoading = ref(true)
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const agreeToTerms = ref(false)

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
  if (password.value !== confirmPassword.value) {
    message.error('两次输入的密码不一致')
    return
  }
  
  if (!captcha.value) {
    message.error('请输入验证码')
    return
  }
  
  if (!agreeToTerms.value) {
    message.error('请先同意用户协议和隐私政策')
    return
  }
  
  if (isLoading.value) return
  
  isLoading.value = true
  
  try {
    // 获取浏览器指纹
    const userid = getUserId()
    
    const result = await register({
      username: username.value,
      email: email.value,
      pass: passHash(password.value),
      code: captcha.value,
      nonce: captchaNonce.value,
      userid: userid
    })
    
    // 处理注册结果并跳转到消息页面
    if (result.is_send_email === 1) {
      router.push({
        path: '/message',
        query: {
          type: 'success',
          title: '注册成功！',
          content: '激活邮件已发送到您的邮箱（<strong>' + email.value + '</strong>），请查看邮箱并完成激活。<br><br>如果您没有收到邮件，请检查垃圾邮件文件夹，或稍后在登录页面重新发送激活邮件。'
        }
      })
    } else if (result.is_send_email === 0) {
      router.push({
        path: '/message',
        query: {
          type: 'warning',
          title: '注册成功',
          content: '您的账号已成功创建，但激活邮件发送失败。<br><br>请稍后尝试登录，您可以在登录界面重新发送激活邮件到邮箱：<strong>' + email.value + '</strong>'
        }
      })
    } else {
      router.push({
        path: '/message',
        query: {
          type: 'success',
          title: '注册成功！',
          content: '恭喜您成功注册账号：<strong>' + username.value + '</strong><br><br>您现在可以使用注册的邮箱和密码登录系统。'
        }
      })
    }
  } catch (error) {
    console.error('注册失败:', error)
    // 注册失败后刷新验证码
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

.register-container {
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

.register-form {
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

.register-button {
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

.register-button:hover {
  background: linear-gradient(45deg, #4dd0e1, #64ffda);
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(100, 255, 218, 0.4);
}

.register-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.form-footer {
  text-align: center;
  margin-top: 1rem;
}

.login-link {
  color: #64ffda;
  text-decoration: none;
  font-size: 0.9rem;
}

.login-link:hover {
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

.agreement-container {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
}

.agreement-checkbox {
  width: auto;
  margin: 0;
  flex-shrink: 0;
  cursor: pointer;
}

.agreement-label {
  font-size: 0.9rem;
  line-height: 1.4;
  cursor: pointer;
  color: #cccccc;
}

.agreement-link {
  color: #64ffda;
  text-decoration: none;
}

.agreement-link:hover {
  text-decoration: underline;
}
</style> 