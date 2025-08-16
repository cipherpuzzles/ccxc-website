<template>
  <div class="home">
    <!-- 主要内容区域 -->
    <div class="main-content">
      <div class="countdown-container">
        <div v-if="!isCountdownFinished" class="countdown">
          <h1 class="countdown-title">距离 {{ projectName || 'CCXC' }} 开赛还有</h1>
          <div class="countdown-display">
            <span v-if="days > 0" class="time-unit">{{ days.toString().padStart(2, '0') }}天</span>
            <span class="time-unit">{{ hours.toString().padStart(2, '0') }}小时</span>
            <span class="time-unit">{{ minutes.toString().padStart(2, '0') }}分</span>
            <span class="time-unit">{{ seconds.toString().padStart(2, '0') }}秒</span>
          </div>
          
          <!-- 内测人员入口 -->
          <div v-if="isBetaTester" class="beta-entrance">
            <button class="beta-button" @click="handleStart" :disabled="isStarting">
              {{ isStarting ? '启动中...' : 'emmmmmm' }}
            </button>
          </div>
        </div>
        <div v-else class="countdown-finished">
          <h1 class="countdown-title">进入 {{ projectName || 'CCXC' }}</h1>
          <button class="start-button" @click="handleStart" :disabled="isStarting">
            {{ isStarting ? '启动中...' : 'START' }}
          </button>
          
          <!-- 新窗口打开链接提示 -->
          <div v-if="showLinkTip" class="link-tip">
            <a :href="startLink" target="_blank" class="start-link">如果没有自动打开新窗口，请手工点击此链接</a>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 确认对话框 -->
    <Modal 
      v-model:visible="showModal"
      title="开赛确认"
      content="开赛后组队信息将被锁定，请确认队伍信息无误后再开赛。"
      @confirm="confirmStart"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { getDefaultSetting, startCompetition } from '@/api'
import { message } from '@/utils/message'
import Modal from '@/components/Modal.vue'

const router = useRouter()
const userStore = useUserStore()

const days = ref(0)
const hours = ref(0)
const minutes = ref(0)
const seconds = ref(0)
const isCountdownFinished = ref(false)

// API响应数据
const projectName = ref('')
const startType = ref(0)
const guestMode = ref(0)

// UI状态
const isStarting = ref(false)
const showModal = ref(false)
const showLinkTip = ref(false)
const startLink = ref('')

// 检查是否为内测人员
const isBetaTester = computed(() => {
  return userStore.etc === "52412"
})

let timer = null
let linkTipTimer = null

// 默认目标时间，将被API返回的start_time覆盖
let targetDate = new Date('2050-08-18T20:00:00').getTime()

const updateCountdown = () => {
  const now = new Date().getTime()
  const distance = targetDate - now

  if (distance < 0) {
    isCountdownFinished.value = true
    if (timer) {
      clearInterval(timer)
    }
    return
  }

  days.value = Math.floor(distance / (1000 * 60 * 60 * 24))
  hours.value = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  minutes.value = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
  seconds.value = Math.floor((distance % (1000 * 60)) / 1000)
}

// 载入默认设置
const loadDefaultSettings = async () => {
  try {
    const data = await getDefaultSetting()
    
    if (data) {
      const { project_name, start_time, start_type, guest_mode } = data
      
      projectName.value = project_name
      startType.value = start_type
      guestMode.value = guest_mode
      
      // 更新倒计时目标时间
      if (start_time) {
        targetDate = start_time
        updateCountdown()
      }
    }
  } catch (error) {
    console.error('获取默认设置失败:', error)
    message.error('获取配置信息失败')
  }
}

// 处理开始按钮点击
const handleStart = async () => {
  if (isStarting.value) return
  
  // 如果是游客模式，直接开始
  if (guestMode.value === 1) {
    await requestStart()
    return
  }
  
  // 检查用户登录状态
  if (!userStore.isLoggedIn()) {
    message.warning('请先登录')
    router.push('/login')
    return
  }
  
  // 检查用户role_id
  if (userStore.roleid < 2) {
    message.warning('必须先建立组队，然后才能开赛')
    return
  }
  
  // 检查start_type
  if (startType.value === 0) {
    // 首次开赛，显示确认对话框
    showModal.value = true
  } else {
    // 已有进度存档，直接开始
    await requestStart()
  }
}

// 确认开始
const confirmStart = async () => {
  await requestStart()
}

// 请求开始比赛
const requestStart = async () => {
  try {
    isStarting.value = true
    
    const data = await startCompetition()
    
    if (data && data.start_prefix) {
      const startPrefix = data.start_prefix
      const loginUrl = `${startPrefix}/login`
      
      // 在新窗口打开
      window.open(loginUrl, '_blank')
      
      // 显示手动链接提示
      startLink.value = loginUrl
      showLinkTip.value = true
      
      // 30秒后隐藏提示
      linkTipTimer = setTimeout(() => {
        showLinkTip.value = false
      }, 30000)
    }
  } catch (error) {
    console.error('启动比赛失败:', error)
  } finally {
    isStarting.value = false
  }
}

onMounted(() => {
  loadDefaultSettings()
  updateCountdown()
  timer = setInterval(updateCountdown, 1000)
})

onUnmounted(() => {
  if (timer) {
    clearInterval(timer)
  }
  if (linkTipTimer) {
    clearTimeout(linkTipTimer)
  }
})
</script>

<style scoped>
.home {
  min-height: calc(100vh - 120px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.main-content {
  text-align: center;
}

.countdown-container {
  max-width: 1200px;
  margin: 0 auto;
}

.countdown-title {
  font-size: 2.5rem;
  color: #ffffff;
  margin-bottom: 2rem;
  font-weight: 300;
  letter-spacing: 2px;
}

.countdown-display {
  display: flex;
  justify-content: center;
  gap: 2rem;
  flex-wrap: wrap;
}

.time-unit {
  font-size: 3rem;
  color: #64ffda;
  font-weight: bold;
  background: rgba(100, 255, 218, 0.1);
  padding: 1.5rem 2rem;
  border-radius: 10px;
  border: 2px solid rgba(100, 255, 218, 0.3);
  min-width: 120px;
  box-shadow: 0 4px 15px rgba(100, 255, 218, 0.2);
  transition: all 0.3s ease;
}

.time-unit:hover {
  background: rgba(100, 255, 218, 0.2);
  box-shadow: 0 6px 20px rgba(100, 255, 218, 0.3);
}

.countdown-finished .countdown-title {
  margin-bottom: 3rem;
}

.start-button {
  font-size: 3rem;
  padding: 1.5rem 4rem;
  background: linear-gradient(45deg, #64ffda, #00bcd4);
  color: #1a1a1a;
  border: none;
  border-radius: 15px;
  cursor: pointer;
  font-weight: bold;
  letter-spacing: 3px;
  box-shadow: 0 8px 25px rgba(100, 255, 218, 0.4);
  transition: all 0.3s ease;
  text-transform: uppercase;
}

.start-button:hover:not(:disabled) {
  transform: translateY(-3px);
  box-shadow: 0 12px 35px rgba(100, 255, 218, 0.6);
  background: linear-gradient(45deg, #4dd0e1, #64ffda);
}

.start-button:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: 0 6px 20px rgba(100, 255, 218, 0.4);
}

.start-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.link-tip {
  margin-top: 2rem;
  padding: 1rem;
  background: rgba(100, 255, 218, 0.1);
  border: 1px solid rgba(100, 255, 218, 0.3);
  border-radius: 8px;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.link-tip p {
  color: #e0e0e0;
  margin: 0 0 0.5rem 0;
  font-size: 14px;
}

.start-link {
  color: #64ffda;
  text-decoration: none;
  word-break: break-all;
  font-size: 14px;
  transition: color 0.2s;
}

.start-link:hover {
  color: #4dd0e1;
  text-decoration: underline;
}

.beta-entrance {
  margin-top: 3rem;
}

.beta-button {
  font-size: 0.8rem;
  padding: 0.3rem 0.8rem;
  background: rgba(255, 255, 255, 0.03);
  color: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 3px;
  cursor: pointer;
  font-weight: 300;
  letter-spacing: 0.5px;
  box-shadow: none;
  transition: all 0.2s ease;
  text-transform: none;
  opacity: 0.3;
}

.beta-button:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.25);
  border-color: rgba(255, 255, 255, 0.08);
  opacity: 0.5;
}

.beta-button:active:not(:disabled) {
  background: rgba(255, 255, 255, 0.02);
  color: rgba(255, 255, 255, 0.2);
}

.beta-button:disabled {
  opacity: 0.1;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .countdown-title {
    font-size: 1.8rem;
    margin-bottom: 1.5rem;
  }
  
  .time-unit {
    font-size: 2rem;
    padding: 1rem 1.5rem;
    min-width: 90px;
  }
  
  .countdown-display {
    gap: 1rem;
  }
  
  .start-button {
    font-size: 2rem;
    padding: 1rem 3rem;
  }
  
  .beta-entrance {
    margin-top: 2rem;
  }
  
  .beta-button {
    font-size: 0.7rem;
    padding: 0.25rem 0.6rem;
  }
  
  .link-tip {
    margin-top: 1.5rem;
    padding: 0.8rem;
  }
}
</style> 