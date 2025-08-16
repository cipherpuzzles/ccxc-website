<template>
  <div class="page-container">
    <div class="content">
      <h1>公告</h1>
      <div class="announcements" v-if="!loading && announcements.length > 0">
        <div class="announcement-item" v-for="announcement in announcements" :key="announcement.aid">
          <div class="announcement-date">
            <span 
              v-if="announcement.create_time === announcement.update_time"
              class="date-text"
            >
              {{ formatDate(announcement.create_time) }}
            </span>
            <span 
              v-else
              class="date-text updated-date"
              :title="`发布时间：${formatDate(announcement.create_time)}`"
            >
              {{ formatDate(announcement.update_time) }} (已更新)
            </span>
          </div>
          <div class="announcement-content" v-html="renderMarkdown(announcement.content)"></div>
        </div>
      </div>
      <div v-else-if="loading" class="loading">
        <p>加载中...</p>
      </div>
      <div v-else class="no-announcements">
        <p>暂无公告</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getAnnouncements } from '@/api'
import { renderMarkdown } from '@/utils/markdown'

const announcements = ref([])
const loading = ref(true)

// 格式化时间戳为可读格式
const formatDate = (timestamp) => {
  const date = new Date(timestamp)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 获取公告列表
const fetchAnnouncements = async () => {
  try {
    loading.value = true
    const response = await getAnnouncements()

    announcements.value = response.announcements || []
  } catch (error) {
    console.error('获取公告失败:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchAnnouncements()
})
</script>

<style scoped>
.page-container {
  min-height: calc(100vh - 120px);
  padding: 2rem;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding-top: 4rem;
}

.content {
  max-width: 800px;
  width: 100%;
}

h1 {
  color: #64ffda;
  font-size: 2.5rem;
  margin-bottom: 2rem;
  text-align: center;
}

.announcements {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.announcement-item {
  background: rgba(255, 255, 255, 0.05);
  padding: 2rem;
  border-radius: 10px;
  border: 1px solid rgba(100, 255, 218, 0.2);
  transition: all 0.3s ease;
}

.announcement-item:hover {
  border-color: rgba(100, 255, 218, 0.4);
  background: rgba(255, 255, 255, 0.08);
}

.announcement-date {
  margin-bottom: 1rem;
}

.date-text {
  color: #64ffda;
  font-size: 0.9rem;
  cursor: default;
}

.updated-date {
  cursor: help;
}

.announcement-content {
  color: #cccccc;
  line-height: 1.6;
}

/* Markdown 内容样式 */
.announcement-content :deep(h1),
.announcement-content :deep(h2),
.announcement-content :deep(h3),
.announcement-content :deep(h4),
.announcement-content :deep(h5),
.announcement-content :deep(h6) {
  color: #ffffff;
  margin-top: 1rem;
  margin-bottom: 0.5rem;
}

.announcement-content :deep(p) {
  margin-bottom: 1rem;
}

.announcement-content :deep(code) {
  background: rgba(100, 255, 218, 0.1);
  color: #64ffda;
  padding: 0.2rem 0.4rem;
  border-radius: 3px;
  font-family: 'Courier New', monospace;
}

.announcement-content :deep(pre) {
  background: rgba(0, 0, 0, 0.3);
  padding: 1rem;
  border-radius: 5px;
  overflow-x: auto;
  margin: 1rem 0;
}

.announcement-content :deep(pre code) {
  background: none;
  padding: 0;
}

.announcement-content :deep(blockquote) {
  border-left: 3px solid #64ffda;
  padding-left: 1rem;
  margin: 1rem 0;
  color: #aaaaaa;
}

.announcement-content :deep(ul),
.announcement-content :deep(ol) {
  margin: 1rem 0;
  padding-left: 2rem;
}

.announcement-content :deep(li) {
  margin-bottom: 0.5rem;
}

.announcement-content :deep(a) {
  color: #64ffda;
  text-decoration: none;
}

.announcement-content :deep(a:hover) {
  text-decoration: underline;
}

.loading,
.no-announcements {
  text-align: center;
  padding: 3rem;
  color: #cccccc;
}
</style> 