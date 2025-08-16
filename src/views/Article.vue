<template>
  <div class="page-container">
    <div class="content-wrapper">
      <!-- 左侧文章导航 -->
      <div class="sidebar">
        <h3>文章导航</h3>
        <div v-if="!loading && articleList.length > 0" class="article-list">
          <router-link
            v-for="item in articleList"
            :key="item.path"
            :to="`/info/${item.path}`"
            class="article-item"
            :class="{ active: item.path === currentPath }"
          >
            {{ item.title }}
          </router-link>
        </div>
        <div v-else-if="loading" class="loading-text">
          <p>加载中...</p>
        </div>
        <div v-else class="no-articles">
          <p>暂无文章</p>
        </div>
      </div>

      <!-- 右侧文章内容 -->
      <div class="main-content">
        <div v-if="!loading && article" class="article-detail">
          <h1 class="article-title">{{ article.title }}</h1>
          <div class="article-content" v-html="renderMarkdown(article.content)"></div>
          <div class="article-meta">
            <span 
              v-if="article.dt_create === article.dt_update"
              class="meta-text"
            >
              发表于 {{ formatDate(article.dt_create) }}
            </span>
            <span 
              v-else
              class="meta-text updated-meta"
              :title="`发表时间：${formatDate(article.dt_create)}`"
            >
              更新于 {{ formatDate(article.dt_update) }}
            </span>
          </div>
        </div>
        <div v-else-if="loading" class="loading">
          <p>加载中...</p>
        </div>
        <div v-else class="no-article">
          <p>文章不存在或加载失败</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { getArticle } from '@/api'
import { renderMarkdown } from '@/utils/markdown'

const route = useRoute()
const article = ref(null)
const articleList = ref([])
const loading = ref(true)
const currentPath = ref('')

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

// 获取文章内容
const fetchArticle = async (path) => {
  try {
    loading.value = true
    const response = await getArticle(path)
    
    article.value = response.article
    articleList.value = response.list || []
    currentPath.value = path
  } catch (error) {
    console.error('获取文章失败:', error)
    article.value = null
  } finally {
    loading.value = false
  }
}

// 监听路由变化
watch(() => route.params.path, (newPath) => {
  if (newPath) {
    fetchArticle(newPath)
  }
}, { immediate: true })

onMounted(() => {
  const path = route.params.path
  if (path) {
    fetchArticle(path)
  }
})
</script>

<style scoped>
.page-container {
  min-height: calc(100vh - 120px);
  padding: 2rem;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding-top: 2rem;
}

.content-wrapper {
  max-width: 1200px;
  width: 100%;
  display: flex;
  gap: 2rem;
}

/* 左侧导航样式 */
.sidebar {
  width: 300px;
  flex-shrink: 0;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  border: 1px solid rgba(100, 255, 218, 0.2);
  padding: 1.5rem;
  height: fit-content;
  position: sticky;
  top: 2rem;
}

.sidebar h3 {
  color: #64ffda;
  font-size: 1.2rem;
  margin-bottom: 1rem;
  text-align: center;
}

.article-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.article-item {
  display: block;
  padding: 0.8rem 1rem;
  color: #cccccc;
  text-decoration: none;
  border-radius: 5px;
  transition: all 0.3s ease;
  border: 1px solid transparent;
}

.article-item:hover {
  background: rgba(100, 255, 218, 0.1);
  color: #64ffda;
}

.article-item.active {
  background: rgba(100, 255, 218, 0.2);
  color: #64ffda;
  border-color: rgba(100, 255, 218, 0.4);
}

.loading-text,
.no-articles {
  text-align: center;
  color: #cccccc;
  padding: 1rem;
}

/* 右侧内容样式 */
.main-content {
  flex: 1;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  border: 1px solid rgba(100, 255, 218, 0.2);
  padding: 2rem;
}

.article-detail {
  color: #cccccc;
}

.article-title {
  color: #64ffda;
  font-size: 2rem;
  margin-bottom: 1.5rem;
  text-align: center;
  border-bottom: 2px solid rgba(100, 255, 218, 0.3);
  padding-bottom: 1rem;
}

.article-content {
  line-height: 1.6;
  margin-bottom: 2rem;
}

/* Markdown 内容样式 */
.article-content :deep(h1),
.article-content :deep(h2),
.article-content :deep(h3),
.article-content :deep(h4),
.article-content :deep(h5),
.article-content :deep(h6) {
  color: #ffffff;
  margin-top: 1.5rem;
  margin-bottom: 0.8rem;
}

.article-content :deep(p) {
  margin-bottom: 1rem;
}

.article-content :deep(code) {
  background: rgba(100, 255, 218, 0.1);
  color: #64ffda;
  padding: 0.2rem 0.4rem;
  border-radius: 3px;
  font-family: 'Courier New', monospace;
}

.article-content :deep(pre) {
  background: rgba(0, 0, 0, 0.3);
  padding: 1rem;
  border-radius: 5px;
  overflow-x: auto;
  margin: 1rem 0;
}

.article-content :deep(pre code) {
  background: none;
  padding: 0;
}

.article-content :deep(blockquote) {
  border-left: 3px solid #64ffda;
  padding-left: 1rem;
  margin: 1rem 0;
  color: #aaaaaa;
}

.article-content :deep(ul),
.article-content :deep(ol) {
  margin: 1rem 0;
  padding-left: 2rem;
}

.article-content :deep(li) {
  margin-bottom: 0.5rem;
}

.article-content :deep(a) {
  color: #64ffda;
  text-decoration: none;
}

.article-content :deep(a:hover) {
  text-decoration: underline;
}

.article-content :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin: 1rem 0;
}

.article-content :deep(th),
.article-content :deep(td) {
  border: 1px solid rgba(100, 255, 218, 0.3);
  padding: 0.5rem;
  text-align: left;
}

.article-content :deep(th) {
  background: rgba(100, 255, 218, 0.1);
  color: #64ffda;
}

.article-meta {
  border-top: 1px solid rgba(100, 255, 218, 0.2);
  padding-top: 1rem;
  text-align: center;
}

.meta-text {
  color: #64ffda;
  font-size: 0.9rem;
}

.updated-meta {
  cursor: help;
}

.loading,
.no-article {
  text-align: center;
  padding: 3rem;
  color: #cccccc;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .content-wrapper {
    flex-direction: column;
  }
  
  .sidebar {
    width: 100%;
    position: relative;
    top: 0;
  }
  
  .page-container {
    padding: 1rem;
  }
}
</style> 