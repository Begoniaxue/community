<template>
  <div class="home-page">
    <div class="container">
      <div class="home-content">
        <div class="main-content">
          <div class="tabs-wrapper">
            <el-tabs v-model="activeTab" class="post-tabs">
              <el-tab-pane label="推荐" name="recommend" />
              <el-tab-pane label="最新" name="latest" />
              <el-tab-pane label="热门" name="hot" />
            </el-tabs>
          </div>

          <div class="debug-info" v-if="false">
            <p>posts.length: {{ posts.length }}</p>
            <p>loading: {{ loading }}</p>
            <p>hasMore: {{ hasMore }}</p>
            <p>activeTab: {{ activeTab }}</p>
          </div>

          <div v-if="loading" class="loading-skeleton">
            <PostCardSkeleton v-for="i in 5" :key="i" />
          </div>

          <div v-else-if="posts.length === 0" class="empty-state">
            <div class="empty-state__icon">📭</div>
            <div class="empty-state__text">暂无内容</div>
          </div>

          <div v-else class="post-list">
            <PostCard
              v-for="post in posts"
              :key="post.id"
              :post="post"
              @like="handleLike"
              @collect="handleCollect"
            />
          </div>

          <div v-if="hasMore && posts.length > 0" class="load-more">
            <el-button v-if="!loadingMore" type="primary" plain @click="loadMore"
              >加载更多</el-button
            >
            <el-button v-else loading type="primary" plain>加载中...</el-button>
          </div>
        </div>

        <aside class="sidebar">
          <div class="sidebar-card hot-topics">
            <h3 class="card-title">热门话题</h3>
            <ul v-if="hotTopics.length">
              <li v-for="(topic, index) in hotTopics" :key="topic" class="topic-item">
                <span class="rank" :class="{ 'top-3': index < 3 }">{{ index + 1 }}</span>
                <span class="topic-name">{{ topic }}</span>
              </li>
            </ul>
            <div v-else class="empty-state">
              <span class="empty-state__text">暂无话题</span>
            </div>
          </div>

          <div class="sidebar-card hot-posts">
            <h3 class="card-title">热门帖子</h3>
            <ul v-if="hotPosts.length">
              <li v-for="(post, index) in hotPosts" :key="post.id" class="hot-post-item">
                <span class="rank" :class="{ 'top-3': index < 3 }">{{ index + 1 }}</span>
                <NuxtLink :to="`/post/${post.id}`" class="post-title text-ellipsis">
                  {{ post.title }}
                </NuxtLink>
              </li>
            </ul>
            <div v-else class="empty-state">
              <span class="empty-state__text">暂无热门</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { postApi } from '~/api/post'
import type { Post } from '~/types'
import { useUserStore } from '~/stores/user'
import PostCardSkeleton from '~/components/PostCardSkeleton.vue'

const userStore = useUserStore()
const activeTab = ref('recommend')
const page = ref(1)
const pageSize = 10
const hasMore = ref(true)
const loading = ref(false)
const loadingMore = ref(false)

const posts = ref<Post[]>([])
const hotPosts = ref<Post[]>([])
const hotTopics = ref<string[]>([])

const extractRecords = (data: any): Post[] => {
  if (Array.isArray(data)) return data
  if (data?.records && Array.isArray(data.records)) return data.records
  if (data?.list && Array.isArray(data.list)) return data.list
  return []
}

const extractTopics = (data: any): string[] => {
  if (Array.isArray(data)) return data.map((t: any) => t.name || t)
  if (data?.records && Array.isArray(data.records)) return data.records.map((t: any) => t.name || t)
  if (data?.list && Array.isArray(data.list)) return data.list.map((t: any) => t.name || t)
  return []
}

const fetchPosts = async (reset: boolean = false) => {
  if (reset) {
    page.value = 1
    hasMore.value = true
    posts.value = []
  }
  loading.value = !loadingMore.value
  loadingMore.value = true
  try {
    const res = await postApi.getList({
      page: page.value,
      pageSize,
      sort: activeTab.value as 'latest' | 'hot' | 'recommend'
    })
    console.log('[首页] fetchPosts 返回:', JSON.stringify(res, null, 2))
    const records = extractRecords(res.data)
    console.log('[首页] 解析到的帖子数量:', records.length)
    if (reset) {
      posts.value = records
    } else {
      posts.value = [...posts.value, ...records]
    }
    const totalPages = res.data?.totalPages || 0
    hasMore.value = page.value < totalPages
    if (records.length > 0) {
      page.value++
    }
    console.log('[首页] posts.value:', posts.value.length, '条')
  } catch (error) {
    console.error('[首页] 获取帖子列表失败:', error)
  } finally {
    loading.value = false
    loadingMore.value = false
  }
}

const fetchHotPosts = async () => {
  try {
    const res = await postApi.getHotList()
    console.log('[首页] fetchHotPosts 返回:', JSON.stringify(res, null, 2))
    hotPosts.value = extractRecords(res.data)
    console.log('[首页] 热门帖子数量:', hotPosts.value.length)
  } catch (error) {
    console.error('[首页] 获取热门帖子失败:', error)
  }
}

const fetchHotTopics = async () => {
  try {
    const res = await postApi.getHotTopics()
    console.log('[首页] fetchHotTopics 返回:', JSON.stringify(res, null, 2))
    hotTopics.value = extractTopics(res.data)
    console.log('[首页] 热门话题数量:', hotTopics.value.length)
  } catch (error) {
    console.error('[首页] 获取热门话题失败:', error)
  }
}

const loadMore = () => {
  if (!hasMore.value || loadingMore.value) return
  fetchPosts(false)
}

const handleLike = async (post: Post) => {
  if (!userStore.isLoggedIn) {
    navigateTo('/login')
    return
  }
  try {
    if (post.isLiked) {
      await postApi.unlike(post.id)
      post.isLiked = false
      post.likesCount = Math.max(0, post.likesCount - 1)
    } else {
      await postApi.like(post.id)
      post.isLiked = true
      post.likesCount++
    }
  } catch (error) {
    console.error('点赞操作失败:', error)
  }
}

const handleCollect = async (post: Post) => {
  if (!userStore.isLoggedIn) {
    navigateTo('/login')
    return
  }
  try {
    if (post.isCollected) {
      await postApi.uncollect(post.id)
      post.isCollected = false
      post.collectionsCount = Math.max(0, post.collectionsCount - 1)
    } else {
      await postApi.collect(post.id)
      post.isCollected = true
      post.collectionsCount++
    }
  } catch (error) {
    console.error('收藏操作失败:', error)
  }
}

watch(activeTab, () => {
  fetchPosts(true)
})

onMounted(() => {
  fetchPosts(true)
  fetchHotPosts()
  fetchHotTopics()
})
</script>

<style scoped lang="scss">
.home-page {
  padding: $spacing-lg 0;
}

.home-content {
  display: flex;
  gap: $spacing-lg;
}

.main-content {
  flex: 1;
  min-width: 0;
}

.tabs-wrapper {
  background: $white;
  border-radius: $border-radius-base;
  padding: 0 $spacing-base;
  margin-bottom: $spacing-base;

  :deep(.el-tabs__nav-wrap::after) {
    display: none;
  }
}

.post-list {
  display: flex;
  flex-direction: column;
  gap: $spacing-base;
}

.load-more {
  text-align: center;
  padding: $spacing-lg;
}

.sidebar {
  width: 300px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: $spacing-base;
}

.sidebar-card {
  background: $white;
  border-radius: $border-radius-base;
  padding: $spacing-base;

  .card-title {
    font-size: $font-size-base;
    font-weight: bold;
    margin-bottom: $spacing-base;
    padding-bottom: $spacing-sm;
    border-bottom: 1px solid $border-light;
  }
}

.hot-topics .topic-item {
  display: flex;
  align-items: center;
  padding: $spacing-sm 0;
  gap: $spacing-sm;

  .rank {
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: $font-size-xs;
    color: $text-secondary;
    background: $bg-color;
    border-radius: $border-radius-sm;

    &.top-3 {
      color: $white;
      background: $primary-color;
    }
  }

  .topic-name {
    font-size: $font-size-sm;
    color: $text-regular;
  }
}

.hot-posts .hot-post-item {
  display: flex;
  align-items: center;
  padding: $spacing-sm 0;
  gap: $spacing-sm;

  .rank {
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: $font-size-xs;
    color: $text-secondary;
    background: $bg-color;
    border-radius: $border-radius-sm;
    flex-shrink: 0;

    &.top-3 {
      color: $white;
      background: $danger-color;
    }
  }

  .post-title {
    font-size: $font-size-sm;
    color: $text-regular;
    transition: color 0.3s;

    &:hover {
      color: $primary-color;
    }
  }
}

.loading-skeleton {
  display: flex;
  flex-direction: column;
  gap: $spacing-base;
}

@media (max-width: 768px) {
  .home-content {
    flex-direction: column;
  }

  .sidebar {
    width: 100%;
  }
}
</style>
