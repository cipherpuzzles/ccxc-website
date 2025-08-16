<template>
  <div class="page-container">
    <div class="message-container">
      <div class="message-icon">
        <font-awesome-icon :icon="iconName" :class="iconClass" />
      </div>
      <h1 class="message-title">{{ title }}</h1>
      <div class="message-content" v-html="content"></div>
      <div class="message-actions">
        <button @click="goToLogin" class="primary-button">前往登录</button>
        <button @click="goHome" class="secondary-button">返回首页</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

// 从路由参数获取消息信息
const messageType = computed(() => route.query.type || 'success')
const title = computed(() => route.query.title || '操作完成')
const content = computed(() => route.query.content || '操作已成功完成')

// 根据消息类型确定图标
const iconName = computed(() => {
  switch (messageType.value) {
    case 'success':
      return 'check-circle'
    case 'warning':
      return 'exclamation-triangle'
    case 'error':
      return 'times-circle'
    case 'info':
      return 'info-circle'
    default:
      return 'check-circle'
  }
})

const iconClass = computed(() => {
  switch (messageType.value) {
    case 'success':
      return 'success-icon'
    case 'warning':
      return 'warning-icon'
    case 'error':
      return 'error-icon'
    case 'info':
      return 'info-icon'
    default:
      return 'success-icon'
  }
})

const goToLogin = () => {
  router.push('/login')
}

const goHome = () => {
  router.push('/')
}

// 如果没有消息内容，重定向到首页
onMounted(() => {
  if (!route.query.content && !route.query.title) {
    router.replace('/')
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

.message-container {
  background: rgba(255, 255, 255, 0.05);
  padding: 3rem;
  border-radius: 15px;
  border: 1px solid rgba(100, 255, 218, 0.2);
  width: 100%;
  max-width: 500px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
  text-align: center;
}

.message-icon {
  font-size: 4rem;
  margin-bottom: 1.5rem;
}

.success-icon {
  color: #4caf50;
}

.warning-icon {
  color: #ff9800;
}

.error-icon {
  color: #f44336;
}

.info-icon {
  color: #2196f3;
}

.message-title {
  color: #64ffda;
  text-align: center;
  margin-bottom: 1.5rem;
  font-size: 1.8rem;
  font-weight: bold;
}

.message-content {
  color: #ffffff;
  line-height: 1.6;
  margin-bottom: 2.5rem;
  font-size: 1.1rem;
}

.message-content p {
  margin-bottom: 1rem;
}

.message-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.primary-button {
  padding: 0.8rem 2rem;
  background: linear-gradient(45deg, #64ffda, #00bcd4);
  color: #1a1a1a;
  border: none;
  border-radius: 5px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 120px;
}

.primary-button:hover {
  background: linear-gradient(45deg, #4dd0e1, #64ffda);
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(100, 255, 218, 0.4);
}

.secondary-button {
  padding: 0.8rem 2rem;
  background: transparent;
  color: #64ffda;
  border: 1px solid #64ffda;
  border-radius: 5px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 120px;
}

.secondary-button:hover {
  background: rgba(100, 255, 218, 0.1);
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(100, 255, 218, 0.2);
}

@media (max-width: 480px) {
  .message-container {
    padding: 2rem;
  }
  
  .message-icon {
    font-size: 3rem;
  }
  
  .message-title {
    font-size: 1.5rem;
  }
  
  .message-content {
    font-size: 1rem;
  }
  
  .message-actions {
    flex-direction: column;
  }
  
  .primary-button,
  .secondary-button {
    width: 100%;
  }
}
</style> 