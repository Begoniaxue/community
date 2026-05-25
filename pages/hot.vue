<template>
  <div class="hot-page">
    <div class="container">
      <h2 class="page-title">🔥 热榜</h2>

      <div class="tabs-wrapper">
        <el-tabs v-model="activeTab">
          <el-tab-pane label="今日热榜" name="today" />
          <el-tab-pane label="本周热榜" name="week" />
          <el-tab-pane label="月度热榜" name="month" />
        </el-tabs>
      </div>

      <div v-if="loading" class="loading-skeleton">
        <PostCardSkeleton v-for="i in 10" :key="i" />
      </div>

      <div v-else-if="hotPosts.length === 0" class="empty-state">
        <div class="empty-state__icon">🔥</div>
        <div class="empty-state__text">暂无热门内容</div>
      </div>

      <div v-else class="hot-list">
        <div
          v-for="(post, index) in hotPosts"
          :key="post.id"
          class="hot-item"
          @click="navigateToPost(post.id)"
        >
          <div class="hot-rank" :class="{ 'top-3': index < 3 }">
            {{ index + 1 }}
          </div>
          <div class="hot-content">
            <h3 class="hot-title text-ellipsis-2">{{ post.title }}</h3>
            <div class="hot-meta">
              <span class="author">{{ post.author.nickname }}</span>
              <span class="hot-value"> 🔥 {{ formatNumber(post.viewsCount) }} 热度 </span>
              <span class="comments">{{ formatNumber(post.commentsCount) }} 评论</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { postApi } from '~/api/post'
import type { Post } from '~/types'
import { formatNumber } from '~/utils'

const activeTab = ref('today')
const loading = ref(false)
const hotPosts = ref<Post[]>([])

const extractArray = (data: any): Post[] => {
  if (Array.isArray(data)) return data
  if (data?.records && Array.isArray(data.records)) return data.records
  if (data?.list && Array.isArray(data.list)) return data.list
  return []
}

const fetchHotPosts = async () => {
  loading.value = true
  try {
    const response = await postApi.getHotList()
    console.log('[热榜] fetchHotPosts 返回:', JSON.stringify(response, null, 2))
    hotPosts.value = extractArray(response.data).slice(0, 20)
    console.log('[热榜] 热门帖子数量:', hotPosts.value.length)
  } catch (error) {
    console.error('获取热榜失败:', error)
  } finally {
    loading.value = false
  }
}

const navigateToPost = (postId: number) => {
  navigateTo(`/post/${postId}`)
}

watch(activeTab, () => {
  fetchHotPosts()
})

onMounted(() => {
  fetchHotPosts()
})
</script>

<style scoped lang="scss">
.hot-page {
  padding: $spacing-lg 0;
}

.page-title {
  font-size: $font-size-xl;
  font-weight: bold;
  margin-bottom: $spacing-lg;
}

.tabs-wrapper {
  background: $white;
  border-radius: $border-radius-base;
  padding: 0 $spacing-base;
  margin-bottom: $spacing-base;
}

.hot-list {
  background: $white;
  border-radius: $border-radius-base;
  overflow: hidden;
}

.hot-item {
  display: flex;
  gap: $spacing-base;
  padding: $spacing-base;
  cursor: pointer;
  transition: background 0.3s;
  border-bottom: 1px solid $border-light;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: $bg-color;
  }
}

.hot-rank {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: $font-size-base;
  font-weight: bold;
  color: $text-secondary;
  background: $bg-color;
  border-radius: $border-radius-sm;
  flex-shrink: 0;

  &.top-3 {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: $white;
  }
}

.hot-content {
  flex: 1;
  min-width: 0;
}

.hot-title {
  font-size: $font-size-base;
  font-weight: 500;
  color: $text-primary;
  margin-bottom: $spacing-xs;
  line-height: 1.4;
}

.hot-meta {
  display: flex;
  gap: $spacing-base;
  font-size: $font-size-xs;
  color: $text-secondary;

  .hot-value {
    color: $danger-color;
  }
}

.loading-skeleton {
  display: flex;
  flex-direction: column;
  gap: $spacing-base;
}
</style>
