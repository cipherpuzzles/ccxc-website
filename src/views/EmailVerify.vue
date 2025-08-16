<template>
  <div class="page-container">
    <div class="verify-container">
      <div class="loading-content" v-if="isLoading">
        <font-awesome-icon icon="spinner" spin class="loading-icon" />
        <h2>正在验证邮箱...</h2>
        <p>请稍候，我们正在验证您的邮箱激活链接</p>
      </div>
      
      <div class="error-content" v-else-if="hasError">
        <font-awesome-icon icon="exclamation-triangle" class="error-icon" />
        <h2>验证失败</h2>
        <p>{{ errorMessage }}</p>
        <div class="button-group">
          <router-link to="/login" class="btn btn-primary">返回登录</router-link>
          <router-link to="/activate" class="btn btn-secondary">重新激活</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { verifyEmailToken } from '@/api'

const route = useRoute()
const router = useRouter()
const isLoading = ref(true)
const hasError = ref(false)
const errorMessage = ref('')

// 验证邮箱token
const verifyToken = async (token) => {
  try {
    const result = await verifyEmailToken(token)
    
    // 验证成功，跳转到消息页面
    const message = result.message || '激活成功，请重新登录'
    router.push({
      name: 'MessagePage',
      query: {
        type: 'success',
        title: '邮箱验证成功',
        content: message
      }
    })
  } catch (error) {
    console.error('邮箱验证失败:', error)
    hasError.value = true
    errorMessage.value = error.message || '验证失败，请检查激活链接是否正确'
    isLoading.value = false
  }
}

// 组件挂载时开始验证
onMounted(() => {
  const token = route.query.token
  
  if (!token) {
    hasError.value = true
    errorMessage.value = '缺少验证token，请检查激活链接是否完整'
    isLoading.value = false
    return
  }
  
  verifyToken(token)
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

.verify-container {
  background: rgba(255, 255, 255, 0.05);
  padding: 3rem;
  border-radius: 15px;
  border: 1px solid rgba(100, 255, 218, 0.2);
  width: 100%;
  max-width: 500px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
  text-align: center;
}

.loading-content {
  color: #ffffff;
}

.loading-icon {
  font-size: 3rem;
  color: #64ffda;
  margin-bottom: 1rem;
}

.error-content {
  color: #ffffff;
}

.error-icon {
  font-size: 3rem;
  color: #ff6b6b;
  margin-bottom: 1rem;
}

h2 {
  color: #64ffda;
  margin-bottom: 1rem;
  font-size: 1.5rem;
}

p {
  color: #cccccc;
  margin-bottom: 2rem;
  line-height: 1.5;
}

.button-group {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.btn {
  padding: 0.8rem 1.5rem;
  border-radius: 5px;
  text-decoration: none;
  font-weight: bold;
  transition: all 0.3s ease;
  border: none;
  cursor: pointer;
  display: inline-block;
}

.btn-primary {
  background: linear-gradient(45deg, #64ffda, #00bcd4);
  color: #1a1a1a;
}

.btn-primary:hover {
  background: linear-gradient(45deg, #4dd0e1, #64ffda);
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(100, 255, 218, 0.4);
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.1);
  color: #64ffda;
  border: 1px solid rgba(100, 255, 218, 0.3);
}

.btn-secondary:hover {
  background: rgba(100, 255, 218, 0.1);
  border-color: #64ffda;
  transform: translateY(-2px);
}

@media (max-width: 480px) {
  .verify-container {
    padding: 2rem;
  }
  
  .button-group {
    flex-direction: column;
  }
  
  .btn {
    width: 100%;
  }
}
</style> 