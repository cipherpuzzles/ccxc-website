<template>
  <div class="page-container">
    <!-- 左侧导航 -->
    <div class="sidebar">
      <div class="search-section">
        <h4>快速导航</h4>
        <div class="search-box">
          <input
            v-model="searchKeyword"
            type="text"
            placeholder="搜索队名..."
            class="search-input"
            @keyup.enter="searchTeam"
          />
          <button @click="searchTeam" class="search-btn">搜索</button>
        </div>
        <div v-if="searchResults.length > 0" class="search-results">
          <div class="search-results-header">
            找到 {{ searchResults.length }} 个队伍：
          </div>
          <div class="search-results-list">
            <button 
              v-for="team in searchResults" 
              :key="`search-${team.gid}`"
              @click="scrollToTeam(team)" 
              class="jump-btn"
            >
              {{ team.group_name }}
            </button>
          </div>
        </div>
        <div v-else-if="searchKeyword && searched" class="no-result">
          未找到队伍
        </div>
      </div>
      
      <div v-if="finishedGroups.length > 0" class="quick-nav">
        <button @click="scrollToFinished" class="nav-btn">
          跳转到已完赛队伍
        </button>
        <button @click="scrollToGroups" class="nav-btn">
          跳转到队伍列表
        </button>
      </div>
    </div>

    <!-- 主内容区 -->
    <div class="main-content">
      <div v-if="loading" class="loading">
        <div class="loading-spinner"></div>
        <p>加载排行榜中...</p>
      </div>

      <div v-else class="scoreboard-content">
        <!-- 更新时间 -->
        <div class="update-time">
          排行榜更新时间：{{ formatTime(cacheTime) }}
        </div>

        <!-- 已完赛队伍 -->
        <div v-if="finishedGroups.length > 0" class="finished-section" ref="finishedSection">
          <h2>已完赛（{{ finishedGroups.length }}）</h2>
          <p class="section-desc">以下队伍已经完赛：</p>
          
          <div class="teams-header">
            <span class="rank-col">排名</span>
            <span class="team-col">队伍</span>
            <span class="problems-col">解答题目数</span>
            <span class="time-col">总用时</span>
          </div>

          <div class="teams-list">
            <div
              v-for="(team, index) in finishedGroups"
              :key="`finished-${team.gid}`"
              class="team-item"
              :id="`team-${team.gid}`"
            >
              <div class="rank-col">{{ index + 1 }}</div>
              <div class="team-col">
                <div class="team-info">
                  <div class="team-header">
                    <h3 class="team-name">{{ team.group_name }}</h3>
                    <div class="member-count-wrapper">
                      <button
                        class="member-count-btn"
                        @mouseenter="showMembers(team, $event)"
                        @mouseleave="hideMembers"
                      >
                        {{ team.users.length }}
                      </button>
                    </div>
                  </div>
                  <p class="team-profile" :class="{ expanded: expandedTeams.includes(team.gid) }">
                    {{ team.group_profile || '暂无队伍简介' }}
                  </p>
                  <button
                    v-if="team.group_profile && team.group_profile.length > 200"
                    @click="toggleExpanded(team.gid)"
                    class="expand-btn"
                  >
                    {{ expandedTeams.includes(team.gid) ? '收起' : '...' }}
                  </button>
                </div>
              </div>
              <div class="problems-col">{{ team.a }} - {{ team.b }}</div>
              <div class="time-col">{{ team.total_time.toFixed(2) }}小时</div>
            </div>
          </div>
        </div>

        <!-- 队伍列表 -->
        <div class="groups-section" ref="groupsSection">
          <h2>队伍列表（{{ groups.length }}）</h2>
          
          <div class="teams-header">
            <span class="team-col">队伍</span>
            <span class="problems-col">解答题目数</span>
          </div>

          <div class="teams-list">
            <div
              v-for="team in groups"
              :key="`group-${team.gid}`"
              class="team-item"
              :id="`team-${team.gid}`"
            >
              <div class="team-col">
                <div class="team-info">
                  <div class="team-header">
                    <h3 class="team-name">{{ team.group_name }}</h3>
                    <div class="member-count-wrapper">
                      <button
                        class="member-count-btn"
                        @mouseenter="showMembers(team, $event)"
                        @mouseleave="hideMembers"
                      >
                        {{ team.users?.length }}
                      </button>
                    </div>
                  </div>
                  <p class="team-profile" :class="{ expanded: expandedTeams.includes(team.gid) }">
                    {{ team.group_profile || '暂无队伍简介' }}
                  </p>
                  <button
                    v-if="team.group_profile && team.group_profile.length > 200"
                    @click="toggleExpanded(team.gid)"
                    class="expand-btn"
                  >
                    {{ expandedTeams.includes(team.gid) ? '收起' : '...' }}
                  </button>
                </div>
              </div>
              <div class="problems-col">{{ team.a }} - {{ team.b }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 队员悬浮框 -->
      <div
        v-if="hoveredTeam"
        class="members-tooltip"
        :style="tooltipStyle"
      >
        <h4>队员列表</h4>
        <div class="members-list">
          <div v-for="user in hoveredTeam.users" :key="user.username" class="member-item">
            <div
              class="member-color"
              :style="{ backgroundColor: user.theme_color }"
            ></div>
            <img
              :src="`https://cn.cravatar.com/avatar/${user.avatar_hash}.png?d=identicon`"
              :alt="user.username"
              class="member-avatar"
            />
            <span class="member-name">
              {{ user.username }}
              <span v-if="user.is_leader === 1" class="leader-badge">队长</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { getScoreboardInfo } from '@/api'
import { message } from '@/utils/message'

// 响应式数据
const loading = ref(true)
const cacheTime = ref(0)
const finishedGroups = ref([])
const groups = ref([])
const expandedTeams = ref([])
const searchKeyword = ref('')
const searchResults = ref([])
const searched = ref(false)

// 队员悬浮框相关
const hoveredTeam = ref(null)
const tooltipStyle = ref({
  display: 'none',
  left: '0px',
  top: '0px'
})

// 获取排行榜数据
async function fetchScoreboard() {
  try {
    loading.value = true
    const response = await getScoreboardInfo()
    
    cacheTime.value = response.cache_time
    finishedGroups.value = response.finished_groups || []
    groups.value = response.groups || []
    
  } catch (error) {
    console.error('获取排行榜失败:', error)
    message.error('获取排行榜失败')
  } finally {
    loading.value = false
  }
}

// 格式化时间
function formatTime(timestamp) {
  if (!timestamp) return '未知时间'
  const date = new Date(timestamp)
  return date.toLocaleString('zh-CN')
}

// 切换队伍简介展开状态
function toggleExpanded(gid) {
  const index = expandedTeams.value.indexOf(gid)
  if (index > -1) {
    expandedTeams.value.splice(index, 1)
  } else {
    expandedTeams.value.push(gid)
  }
}

// 搜索队伍
function searchTeam() {
  if (!searchKeyword.value.trim()) {
    searchResults.value = []
    searched.value = false
    return
  }
  
  searched.value = true
  const keyword = searchKeyword.value.trim().toLowerCase()
  const results = []
  
  // 在已完赛队伍中搜索
  const finishedMatches = finishedGroups.value.filter(team => 
    team.group_name.toLowerCase().includes(keyword)
  )
  results.push(...finishedMatches)
  
  // 在未完赛队伍中搜索
  const groupMatches = groups.value.filter(team => 
    team.group_name.toLowerCase().includes(keyword)
  )
  results.push(...groupMatches)
  
  searchResults.value = results
}

// 滚动到指定队伍
function scrollToTeam(team) {
  const element = document.getElementById(`team-${team.gid}`)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'center' })
    // 高亮显示
    element.classList.add('highlight')
    setTimeout(() => {
      element.classList.remove('highlight')
    }, 3000)
  }
}

// 滚动到已完赛队伍
function scrollToFinished() {
  if (finishedGroups.value.length === 0) return
  const element = document.querySelector('.finished-section')
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

// 滚动到队伍列表
function scrollToGroups() {
  const element = document.querySelector('.groups-section')
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

// 显示队员列表
function showMembers(team, event) {
  hoveredTeam.value = team
  const rect = event.target.getBoundingClientRect()
  tooltipStyle.value = {
    display: 'block',
    left: (rect.right + 10) + 'px',
    top: rect.top + 'px'
  }
}

// 隐藏队员列表
function hideMembers() {
  hoveredTeam.value = null
  tooltipStyle.value = {
    display: 'none',
    left: '0px',
    top: '0px'
  }
}

// 组件挂载时获取数据
onMounted(() => {
  fetchScoreboard()
})
</script>

<style scoped>
.page-container {
  min-height: calc(100vh - 120px);
  display: flex;
  background: #0a0e1a;
  color: #ffffff;
}

.sidebar {
  width: 300px;
  background: rgba(255, 255, 255, 0.05);
  border-right: 1px solid rgba(100, 255, 218, 0.2);
  padding: 2rem;
  position: sticky;
  top: 0;
  height: fit-content;
  max-height: calc(100vh - 120px);
  overflow-y: auto;
}

.search-section {
  margin-bottom: 2rem;
}

.search-section h4 {
  color: #64ffda;
  margin-bottom: 1rem;
  font-size: 1.1rem;
}

.search-box {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.search-input {
  padding: 0.75rem;
  border: 1px solid rgba(100, 255, 218, 0.3);
  border-radius: 5px;
  background: rgba(255, 255, 255, 0.05);
  color: #ffffff;
  font-size: 0.9rem;
}

.search-input:focus {
  outline: none;
  border-color: #64ffda;
}

.search-input::placeholder {
  color: #cccccc;
}

.search-btn {
  padding: 0.5rem 1rem;
  background: linear-gradient(135deg, #64ffda, #00bcd4);
  color: #000000;
  border: none;
  border-radius: 5px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.search-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 3px 10px rgba(100, 255, 218, 0.3);
}

.search-results,
.no-result {
  margin-top: 1rem;
  padding: 0.5rem 0;
}

.search-results-header {
  color: #64ffda;
  font-size: 0.9rem;
  margin-bottom: 0.75rem;
  font-weight: 500;
}

.search-results-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-height: 200px;
  overflow-y: auto;
}

.jump-btn {
  width: 100%;
  padding: 0.75rem 1rem;
  background: rgba(100, 255, 218, 0.1);
  color: #64ffda;
  border: 1px solid rgba(100, 255, 218, 0.3);
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 0.9rem;
  line-height: 1.4;
  text-align: left;
  white-space: normal;
  word-break: break-word;
  min-height: 44px;
  display: flex;
  align-items: center;
}

.jump-btn:hover {
  background: rgba(100, 255, 218, 0.2);
}

.no-result {
  color: #999999;
  text-align: center;
  font-size: 0.9rem;
}

.quick-nav {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.nav-btn {
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.05);
  color: #ffffff;
  border: 1px solid rgba(100, 255, 218, 0.2);
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 0.9rem;
}

.nav-btn:hover {
  background: rgba(100, 255, 218, 0.1);
  border-color: rgba(100, 255, 218, 0.4);
}

.main-content {
  flex: 1;
  padding: 2rem;
  overflow-y: auto;
}

.loading {
  text-align: center;
  padding: 3rem;
  color: #ffffff;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(100, 255, 218, 0.3);
  border-top: 4px solid #64ffda;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.update-time {
  background: rgba(100, 255, 218, 0.1);
  border: 1px solid rgba(100, 255, 218, 0.3);
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 2rem;
  color: #64ffda;
  text-align: center;
  font-weight: 500;
}

.finished-section,
.groups-section {
  margin-bottom: 3rem;
}

.finished-section h2,
.groups-section h2 {
  color: #64ffda;
  font-size: 1.8rem;
  margin-bottom: 0.5rem;
}

.section-desc {
  color: #cccccc;
  margin-bottom: 1.5rem;
  font-size: 1rem;
}

.teams-header {
  display: grid;
  grid-template-columns: 80px 1fr 150px 120px;
  padding: 1rem 1.5rem;
  background: rgba(100, 255, 218, 0.1);
  border: 1px solid rgba(100, 255, 218, 0.2);
  border-radius: 8px 8px 0 0;
  color: #64ffda;
  font-weight: 600;
  font-size: 0.95rem;
}

.groups-section .teams-header {
  grid-template-columns: 1fr 150px;
}

.teams-list {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(100, 255, 218, 0.2);
  border-top: none;
  border-radius: 0 0 8px 8px;
}

.team-item {
  display: grid;
  grid-template-columns: 80px 1fr 150px 120px;
  padding: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s;
  align-items: start;
}

.groups-section .team-item {
  grid-template-columns: 1fr 150px;
}

.team-item:last-child {
  border-bottom: none;
}

.team-item:hover {
  background: rgba(100, 255, 218, 0.05);
}

.team-item.highlight {
  background: rgba(100, 255, 218, 0.15);
  animation: highlight 3s ease-out;
}

@keyframes highlight {
  0% { background: rgba(100, 255, 218, 0.3); }
  100% { background: rgba(100, 255, 218, 0.05); }
}

.rank-col,
.problems-col,
.time-col {
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  color: #ffffff;
}

.rank-col {
  font-size: 1.1rem;
  color: #64ffda;
}

.team-col {
  padding: 0 1rem;
}

.team-info {
  width: 100%;
}

.team-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.team-name {
  color: #ffffff;
  font-size: 1.2rem;
  font-weight: 600;
  margin: 0;
  flex: 1;
}

.member-count-wrapper {
  margin-left: 1rem;
}

.member-count-btn {
  background: rgba(100, 255, 218, 0.2);
  color: #64ffda;
  border: 1px solid rgba(100, 255, 218, 0.3);
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 600;
  transition: all 0.3s;
}

.member-count-btn:hover {
  background: rgba(100, 255, 218, 0.3);
  border-color: rgba(100, 255, 218, 0.5);
  transform: scale(1.1);
}

.team-profile {
  color: #cccccc;
  line-height: 1.5;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 0.95rem;
}

.team-profile.expanded {
  -webkit-line-clamp: unset;
  display: block;
}

.expand-btn {
  background: none;
  border: none;
  color: #64ffda;
  cursor: pointer;
  font-size: 0.9rem;
  margin-top: 0.5rem;
  padding: 0;
  text-decoration: underline;
}

.expand-btn:hover {
  color: #ffffff;
}

.members-tooltip {
  position: fixed;
  background: rgba(0, 0, 0, 0.95);
  border: 1px solid rgba(100, 255, 218, 0.3);
  border-radius: 8px;
  padding: 1rem;
  z-index: 1000;
  min-width: 200px;
  max-width: 300px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.5);
}

.members-tooltip h4 {
  color: #64ffda;
  margin: 0 0 0.75rem 0;
  font-size: 1rem;
}

.members-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.member-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.member-color {
  width: 12px;
  height: 12px;
  border-radius: 2px;
  flex-shrink: 0;
}

.member-avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}

.member-name {
  color: #ffffff;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.leader-badge {
  background: linear-gradient(135deg, #64ffda, #00bcd4);
  color: #000000;
  padding: 0.2rem 0.4rem;
  border-radius: 3px;
  font-size: 0.7rem;
  font-weight: 600;
}

@media (max-width: 1024px) {
  .page-container {
    flex-direction: column;
  }
  
  .sidebar {
    width: 100%;
    position: static;
    max-height: none;
    border-right: none;
    border-bottom: 1px solid rgba(100, 255, 218, 0.2);
  }
  
  .quick-nav {
    flex-direction: row;
  }
  
  .main-content {
    padding: 1rem;
  }
}

@media (max-width: 768px) {
  .teams-header,
  .team-item {
    grid-template-columns: 60px 1fr 100px 80px;
    padding: 1rem;
    font-size: 0.9rem;
  }
  
  .groups-section .teams-header,
  .groups-section .team-item {
    grid-template-columns: 1fr 100px;
  }
  
  .team-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .member-count-wrapper {
    margin-left: 0;
  }
  
  .team-name {
    font-size: 1.1rem;
  }
  
  .search-box {
    gap: 0.75rem;
  }
  
  .quick-nav {
    flex-direction: column;
    gap: 0.75rem;
  }
}
</style> 