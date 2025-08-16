<template>
  <nav class="navbar">
    <div class="nav-container">
      <!-- 左侧导航 -->
      <div class="nav-left">
        <router-link to="/" class="nav-brand">CCXC</router-link>
        <div class="nav-links">
          <router-link to="/info/about" class="nav-link">关于</router-link>
          <router-link to="/announcements" class="nav-link">公告</router-link>
          <router-link to="/leaderboard" class="nav-link">排行榜</router-link>
        </div>
      </div>
      
      <!-- 右侧导航 -->
      <div class="nav-right">
        <!-- 未登录时显示 -->
        <template v-if="!userStore.isLoggedIn()">
          <router-link to="/login" class="nav-link">登录</router-link>
          <router-link to="/register" class="nav-link nav-register">注册</router-link>
        </template>
        
        <!-- 已登录时显示 -->
        <template v-else>
          <!-- 队伍按钮 -->
          <router-link to="/group" class="nav-link nav-team">
            {{ userStore.roleid > 2 ? '队伍详情' : '立即报名' }}
          </router-link>
          
          <!-- 用户下拉菜单 -->
          <div class="user-dropdown" @mouseenter="showDropdown" @mouseleave="hideDropdown">
            <span class="username">{{ userStore.username }}</span>
            <div class="dropdown-menu" :class="{ show: isDropdownVisible }">
              <a href="#" class="dropdown-item" @click.prevent="goToProfile">个人中心</a>
              <a href="#" class="dropdown-item" @click.prevent="goToChangePassword">修改密码</a>
              <a href="#" class="dropdown-item logout" @click.prevent="logout">注销</a>
            </div>
          </div>
        </template>
      </div>
      
      <!-- 移动端菜单按钮 -->
      <div class="mobile-menu-button" @click="toggleMobileMenu">
        <span :class="{ active: isMobileMenuOpen }">☰</span>
      </div>
    </div>
    
    <!-- 移动端菜单 -->
    <div class="mobile-menu" :class="{ active: isMobileMenuOpen }">
      <router-link to="/info/about" class="mobile-nav-link" @click="closeMobileMenu">关于</router-link>
      <router-link to="/announcements" class="mobile-nav-link" @click="closeMobileMenu">公告</router-link>
      <router-link to="/leaderboard" class="mobile-nav-link" @click="closeMobileMenu">排行榜</router-link>
      
      <!-- 移动端未登录时显示 -->
      <template v-if="!userStore.isLoggedIn()">
        <router-link to="/login" class="mobile-nav-link" @click="closeMobileMenu">登录</router-link>
        <router-link to="/register" class="mobile-nav-link mobile-nav-register" @click="closeMobileMenu">注册</router-link>
      </template>
      
      <!-- 移动端已登录时显示 -->
      <template v-else>
        <router-link to="/group" class="mobile-nav-link" @click="closeMobileMenu">
          {{ userStore.roleid > 2 ? '队伍详情' : '立即报名' }}
        </router-link>
        <a href="#" class="mobile-nav-link" @click.prevent="goToProfile">个人中心</a>
        <a href="#" class="mobile-nav-link" @click.prevent="goToChangePassword">修改密码</a>
        <a href="#" class="mobile-nav-link logout" @click.prevent="logout">注销</a>
      </template>
    </div>
  </nav>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import request from '@/utils/request'

const router = useRouter()
const userStore = useUserStore()

const isMobileMenuOpen = ref(false)
const isDropdownVisible = ref(false)

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}

const closeMobileMenu = () => {
  isMobileMenuOpen.value = false
}

const showDropdown = () => {
  isDropdownVisible.value = true
}

const hideDropdown = () => {
  isDropdownVisible.value = false
}

const goToProfile = () => {
  router.push('/profile')
  closeMobileMenu()
}

const goToChangePassword = () => {
  router.push('/change-password')
  closeMobileMenu()
}

const logout = async () => {
  try {
    // 向服务器发送注销请求
    await request({
      url: '/v1/user-logout'
    })
  } catch (error) {
    // 即使请求失败也继续注销流程
    console.error('注销请求失败:', error)
  } finally {
    // 清除用户信息并跳转到登录页
    userStore.clearUserInfo()
    router.push('/login')
    closeMobileMenu()
  }
}
</script>

<style scoped>
.navbar {
  background: rgba(0, 0, 0, 0.9);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(100, 255, 218, 0.2);
  position: sticky;
  top: 0;
  z-index: 1000;
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 60px;
}

.nav-left {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.nav-brand {
  font-size: 1.5rem;
  font-weight: bold;
  color: #64ffda;
  text-decoration: none;
  letter-spacing: 2px;
}

.nav-links {
  display: flex;
  gap: 2rem;
}

.nav-right {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.nav-link {
  color: #ffffff;
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 5px;
  transition: all 0.3s ease;
  font-weight: 500;
}

.nav-link:hover {
  color: #64ffda;
  background: rgba(100, 255, 218, 0.1);
}

.nav-link.router-link-active {
  color: #64ffda;
  background: rgba(100, 255, 218, 0.1);
}

.nav-register {
  background: linear-gradient(45deg, #64ffda, #00bcd4);
  color: #1a1a1a !important;
  font-weight: bold;
}

.nav-register:hover {
  background: linear-gradient(45deg, #4dd0e1, #64ffda);
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(100, 255, 218, 0.4);
}

.nav-team {
  background: linear-gradient(45deg, #ff6b6b, #ff8e53);
  color: #ffffff !important;
  font-weight: bold;
}

.nav-team:hover {
  background: linear-gradient(45deg, #ff5252, #ff7043);
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(255, 107, 107, 0.4);
}

.user-dropdown {
  position: relative;
  cursor: pointer;
}

.username {
  color: #64ffda;
  font-weight: 500;
  padding: 0.5rem 1rem;
  border-radius: 5px;
  transition: all 0.3s ease;
}

.username:hover {
  background: rgba(100, 255, 218, 0.1);
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  background: rgba(0, 0, 0, 0.95);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(100, 255, 218, 0.2);
  border-radius: 8px;
  min-width: 150px;
  opacity: 0;
  visibility: hidden;
  transform: translateY(-10px);
  transition: all 0.3s ease;
  z-index: 1001;
}

.dropdown-menu.show {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

.dropdown-item {
  display: block;
  color: #ffffff;
  text-decoration: none;
  padding: 0.75rem 1rem;
  transition: all 0.3s ease;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.dropdown-item:last-child {
  border-bottom: none;
}

.dropdown-item:hover {
  color: #64ffda;
  background: rgba(100, 255, 218, 0.1);
}

.dropdown-item.logout:hover {
  color: #ff6b6b;
  background: rgba(255, 107, 107, 0.1);
}

.mobile-menu-button {
  display: none;
  cursor: pointer;
  font-size: 1.5rem;
  color: #ffffff;
  padding: 0.5rem;
}

.mobile-menu {
  display: none;
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(100, 255, 218, 0.2);
  padding: 1rem 0;
}

.mobile-nav-link {
  display: block;
  color: #ffffff;
  text-decoration: none;
  padding: 1rem 2rem;
  transition: all 0.3s ease;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.mobile-nav-link:hover {
  color: #64ffda;
  background: rgba(100, 255, 218, 0.1);
}

.mobile-nav-link.logout:hover {
  color: #ff6b6b;
  background: rgba(255, 107, 107, 0.1);
}

.mobile-nav-register {
  background: linear-gradient(45deg, #64ffda, #00bcd4);
  color: #1a1a1a !important;
  font-weight: bold;
  margin: 1rem 2rem;
  border-radius: 5px;
  text-align: center;
}

@media (max-width: 768px) {
  .nav-links,
  .nav-right {
    display: none;
  }
  
  .mobile-menu-button {
    display: block;
  }
  
  .mobile-menu.active {
    display: block;
  }
}
</style> 