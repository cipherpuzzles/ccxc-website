<template>
  <div class="page-container">
    <div class="profile-container">
      <div class="profile-header">
        <!-- 用户头像 -->
        <div class="avatar-container">
          <img 
            :src="avatarUrl" 
            :alt="userInfo.username"
            class="user-avatar"
            @error="handleAvatarError"
          />
        </div>
        
        <!-- 用户名 -->
        <h1 class="username">{{ userInfo.username }}</h1>
        
        <!-- UID -->
        <p class="uid-text">UID: {{ userInfo.uid }}</p>
        
        <!-- 角色标签 -->
        <RoleBadge :roleid="userInfo.roleid" />
      </div>
      
      <!-- 个人简介 -->
      <div class="profile-section">
        <div 
          class="profile-box" 
          :style="{ 
            borderColor: userInfo.theme_color,
            boxShadow: `0 0 15px ${userInfo.theme_color}40`
          }"
        >
          <div class="profile-content">
            {{ userInfo.profile || '这个人很懒，什么都没有留下...' }}
          </div>
        </div>
      </div>
      
      <!-- 编辑按钮 -->
      <div class="profile-actions">
        <button class="edit-button" @click="showEditModal = true">
          编辑资料
        </button>
        <router-link to="/change-password" class="action-button">
          修改密码
        </router-link>
        <router-link to="/" class="action-button secondary">
          返回首页
        </router-link>
      </div>
    </div>
    
    <!-- 编辑模态框 -->
    <div v-if="showEditModal" class="modal-overlay" @click="handleModalOverlay">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>编辑个人资料</h3>
          <button class="modal-close" @click="showEditModal = false">×</button>
        </div>
        
        <div class="modal-body">
          <!-- 头像修改提示 -->
          <div class="avatar-tips">
            <div 
              class="tips-text"
              @mouseenter="handleTooltipEnter"
              @mouseleave="handleTooltipLeave"
            >
              修改头像
            </div>
            <div 
              v-if="showAvatarTooltip" 
              class="avatar-tooltip"
              @mouseenter="handleTooltipEnter"
              @mouseleave="handleTooltipLeave"
            >
              <p>CCXC Engine 正在使用基于邮箱的通用头像。</p>
              <p>您可以前往 <a href="https://en.gravatar.com/" target="_blank" rel="noopener">Gravatar</a> 或 <a href="https://cravatar.cn/" target="_blank" rel="noopener">Cravatar.cn</a> 设置您注册邮箱的头像。</p>
              <p>注：如果您使用QQ数字邮箱注册，将自动同步您的QQ头像。</p>
            </div>
          </div>
          
          <!-- 用户名编辑 -->
          <div class="form-group">
            <label>用户名</label>
            <input 
              type="text" 
              v-model="editForm.username"
              class="form-input"
              placeholder="请输入用户名"
            />
          </div>
          
          <!-- 个人简介编辑 -->
          <div class="form-group">
            <label>个人简介</label>
            <textarea 
              v-model="editForm.profile"
              class="form-textarea"
              placeholder="介绍一下自己吧..."
              rows="4"
            ></textarea>
          </div>
          
          <!-- 主题色编辑 -->
          <div class="form-group">
            <label>主题色</label>
            <div class="color-picker-container">
              <input 
                type="color" 
                v-model="editForm.theme_color"
                class="color-picker"
              />
              <span class="color-value">{{ editForm.theme_color }}</span>
            </div>
          </div>
        </div>
        
        <div class="modal-footer">
          <button class="modal-btn modal-btn-cancel" @click="showEditModal = false">
            取消
          </button>
          <button class="modal-btn modal-btn-confirm" @click="saveProfile" :disabled="saving">
            {{ saving ? '保存中...' : '保存' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { message } from '@/utils/message'
import { getProfileInfo, editUser } from '@/api'
import RoleBadge from '@/components/RoleBadge.vue'

const router = useRouter()
const userStore = useUserStore()

// 响应式数据
const userInfo = ref({
  uid: '',
  username: '',
  email: '',
  roleid: 0,
  theme_color: '#64ffda',
  avatar_hash: '',
  profile: ''
})

const showEditModal = ref(false)
const showAvatarTooltip = ref(false)
const saving = ref(false)
const tooltipTimer = ref(null)

const editForm = ref({
  username: '',
  profile: '',
  theme_color: '#64ffda'
})

// 计算属性
const avatarUrl = computed(() => {
  return userInfo.value.avatar_hash 
    ? `https://cn.cravatar.com/avatar/${userInfo.value.avatar_hash}.png?d=identicon`
    : 'https://cn.cravatar.com/avatar/default.png?d=identicon'
})

// 方法
const loadUserInfo = async () => {
  try {
    const data = await getProfileInfo()
    if (data) {
      userInfo.value = data.user_info
      // 初始化编辑表单
      editForm.value = {
        username: userInfo.value.username,
        profile: userInfo.value.profile || '',
        theme_color: userInfo.value.theme_color || '#64ffda'
      }
    }
  } catch (error) {
    console.error('获取用户信息失败:', error)
    message.error('获取用户信息失败')
  }
}



const handleAvatarError = (event) => {
  event.target.src = 'https://cn.cravatar.com/avatar/default.png?d=identicon'
}

const handleModalOverlay = (event) => {
  if (event.target === event.currentTarget) {
    showEditModal.value = false
  }
}

const handleTooltipEnter = () => {
  // 清除可能存在的隐藏计时器
  if (tooltipTimer.value) {
    clearTimeout(tooltipTimer.value)
    tooltipTimer.value = null
  }
  showAvatarTooltip.value = true
}

const handleTooltipLeave = () => {
  // 设置延迟隐藏，给用户时间移动鼠标到tooltip
  tooltipTimer.value = setTimeout(() => {
    showAvatarTooltip.value = false
    tooltipTimer.value = null
  }, 200)
}

const saveProfile = async () => {
  if (saving.value) return
  
  saving.value = true
  try {
    await editUser(editForm.value)
    message.success('保存成功')
    showEditModal.value = false
    // 重新加载用户信息
    await loadUserInfo()
  } catch (error) {

  } finally {
    saving.value = false
  }
}

// 生命周期
onMounted(() => {
  // 检查登录状态
  if (!userStore.isLoggedIn()) {
    message.error('请先登录')
    router.push('/login')
    return
  }
  
  loadUserInfo()
})

onUnmounted(() => {
  // 清理计时器
  if (tooltipTimer.value) {
    clearTimeout(tooltipTimer.value)
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

.profile-container {
  background: rgba(255, 255, 255, 0.05);
  padding: 3rem;
  border-radius: 15px;
  border: 1px solid rgba(100, 255, 218, 0.2);
  width: 100%;
  max-width: 600px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
}

.profile-header {
  text-align: center;
  margin-bottom: 2rem;
}

.avatar-container {
  margin-bottom: 1rem;
}

.user-avatar {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  border: 3px solid #64ffda;
  box-shadow: 0 4px 15px rgba(100, 255, 218, 0.3);
  object-fit: cover;
}

.username {
  color: #64ffda;
  margin: 1rem 0 0.5rem 0;
  font-size: 2rem;
  font-weight: bold;
}

.uid-text {
  color: #999;
  margin: 0 0 1rem 0;
  font-size: 0.9rem;
}

.profile-header :deep(.role-badge) {
  margin-bottom: 1rem;
}

.profile-section {
  margin-bottom: 2rem;
}

.profile-box {
  border: 2px solid #64ffda;
  border-radius: 10px;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.03);
  transition: all 0.3s ease;
}

.profile-content {
  color: #ffffff;
  line-height: 1.6;
  font-size: 1rem;
  text-align: center;
  min-height: 1.5rem;
}

.profile-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.edit-button {
  padding: 0.8rem 1.5rem;
  background: linear-gradient(45deg, #64ffda, #00bcd4);
  color: #1a1a1a;
  border: none;
  border-radius: 5px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.edit-button:hover {
  background: linear-gradient(45deg, #4dd0e1, #64ffda);
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(100, 255, 218, 0.4);
}

.action-button {
  padding: 0.8rem 1.5rem;
  background: linear-gradient(45deg, #64ffda, #00bcd4);
  color: #1a1a1a;
  border: none;
  border-radius: 5px;
  font-size: 1rem;
  font-weight: bold;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
}

.action-button:hover {
  background: linear-gradient(45deg, #4dd0e1, #64ffda);
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(100, 255, 218, 0.4);
}

.action-button.secondary {
  background: rgba(255, 255, 255, 0.1);
  color: #ffffff;
}

.action-button.secondary:hover {
  background: rgba(255, 255, 255, 0.2);
  color: #64ffda;
  box-shadow: 0 4px 15px rgba(255, 255, 255, 0.1);
}

/* 模态框样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
}

.modal-content {
  background: #2a2a2a;
  border-radius: 8px;
  min-width: 500px;
  max-width: 90vw;
  max-height: 90vh;
  overflow-y: auto;
  border: 1px solid #444;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #444;
}

.modal-header h3 {
  color: #ffffff;
  margin: 0;
  font-size: 18px;
  font-weight: 500;
}

.modal-close {
  background: none;
  border: none;
  color: #999;
  font-size: 24px;
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s;
}

.modal-close:hover {
  color: #fff;
}

.modal-body {
  padding: 20px;
}

.avatar-tips {
  position: relative;
  margin-bottom: 20px;
}

.tips-text {
  color: #64ffda;
  cursor: help;
  font-weight: 500;
  display: inline-block;
  border-bottom: 1px dashed #64ffda;
}

.avatar-tooltip {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: #333;
  border: 1px solid #555;
  border-radius: 6px;
  padding: 12px;
  z-index: 1000;
  font-size: 12px;
  line-height: 1.4;
  color: #e0e0e0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.avatar-tooltip p {
  margin: 0 0 8px 0;
}

.avatar-tooltip p:last-child {
  margin-bottom: 0;
}

.avatar-tooltip a {
  color: #64ffda;
  text-decoration: none;
}

.avatar-tooltip a:hover {
  text-decoration: underline;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  color: #ffffff;
  margin-bottom: 8px;
  font-weight: 500;
}

.form-input, .form-textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #555;
  border-radius: 4px;
  background: #1a1a1a;
  color: #ffffff;
  font-size: 14px;
  transition: border-color 0.2s;
}

.form-input:focus, .form-textarea:focus {
  outline: none;
  border-color: #64ffda;
  box-shadow: 0 0 0 2px rgba(100, 255, 218, 0.2);
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

.color-picker-container {
  display: flex;
  align-items: center;
  gap: 10px;
}

.color-picker {
  width: 50px;
  height: 35px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.color-value {
  color: #ffffff;
  font-family: monospace;
  font-size: 14px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 20px;
  border-top: 1px solid #444;
}

.modal-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.modal-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.modal-btn-cancel {
  background: #444;
  color: #fff;
}

.modal-btn-cancel:hover:not(:disabled) {
  background: #555;
}

.modal-btn-confirm {
  background: #64ffda;
  color: #1a1a1a;
  font-weight: 500;
}

.modal-btn-confirm:hover:not(:disabled) {
  background: #4dd0e1;
}

@media (max-width: 768px) {
  .profile-container {
    padding: 2rem;
  }
  
  .profile-actions {
    flex-direction: column;
  }
  
  .action-button, .edit-button {
    width: 100%;
  }
  
  .modal-content {
    min-width: auto;
    margin: 20px;
  }
}

@media (max-width: 480px) {
  .user-avatar {
    width: 100px;
    height: 100px;
  }
  
  .username {
    font-size: 1.5rem;
  }
}
</style> 