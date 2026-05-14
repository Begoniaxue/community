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

          <div v-if="!isLoading && posts.length === 0" class="empty-state">
            <div class="empty-state__icon">📭</div>
            <div class="empty-state__text">暂无内容</div>
          </div>

          <div v-else class="post-list">
            <div
              v-for="post in posts"
              :key="post.id"
              @click="navigateToPost(post.id)"
              class="post-card-wrapper"
            >
              <PostCard
                :post="post"
                @like="handleLike"
                @collect="handleCollect"
              />
            </div>
          </div>

          <div v-if="hasMore" class="load-more">
            <el-button v-if="!loadingMore" @click="loadMore" type="primary" plain>加载更多</el-button>
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
              <li
                v-for="(post, index) in hotPosts"
                :key="post.id"
                class="hot-post-item"
                @click="navigateToPost(post.id)"
              >
                <span class="rank" :class="{ 'top-3': index < 3 }">{{ index + 1 }}</span>
                <span class="post-title text-ellipsis">
                  {{ post.title }}
                </span>
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
import { ref, watch, useAsyncData, useState } from '#imports'
import type { Post } from '~/api/post'
import { postApi } from '~/api/post'
import { useUserStore } from '~/stores/user'

const userStore = useUserStore()
const activeTab = ref('recommend')
const page = ref(1)
const pageSize = 10
const hasMore = ref(true)
const loadingMore = ref(false)

const isLoading = ref(false)

const generateMockPosts = (startIndex: number, count: number): Post[] => {
  const avatars = [
    'https://api.dicebear.com/7.x/avataaars/svg?seed=1',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=2',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=3',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=4',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=5'
  ]
  const titles = [
    '分享一个超实用的 Vue3 开发技巧',
    '今天的天气真不错，适合写代码',
    '有人一起学习 TypeScript 吗？',
    '这个组件库真的太好用了',
    '记录一下今天踩的坑',
    'Nuxt3 SSR 开发经验分享',
    '前端性能优化的几个小技巧',
    '推荐一个免费的 API 接口平台',
    'CSS 动画实现波浪效果',
    '如何优雅地处理异步请求'
  ]
  const contents = [
    '这是一篇关于前端开发的文章，包含了很多实用的技巧和经验分享。希望对大家有所帮助。',
    '最近在学习新技术，遇到了一些问题，记录下来以便以后查阅。',
    '分享一下我的开发经验，希望能帮助到更多的开发者。',
    '整理了一些常用的代码片段，收藏起来以后备用。'
  ]
  const categories = ['技术', '生活', '学习', '娱乐']
  const nicknames = ['程序员小王', '前端小白', '代码达人', 'Vue爱好者', '全栈工程师']
  const viewsCounts = [1234, 2345, 3456, 4567, 5678, 6789, 7890, 8901, 9012, 1023]
  const likesCounts = [123, 234, 345, 456, 567, 678, 789, 890, 901, 102]
  const commentsCounts = [45, 67, 89, 23, 56, 78, 90, 12, 34, 89]
  const collectionsCounts = [56, 78, 90, 123, 45, 67, 89, 23, 56, 78]
  const isLikedValues = [false, true, false, false, true, false, true, false, false, true]
  const isCollectedValues = [false, false, true, false, false, true, false, false, true, false]
  const now = new Date('2026-05-14T10:00:00Z')
  const createdAtDates = [
    now.toISOString().slice(0, 19).replace('T', ' '),
    new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' '),
    new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' '),
    new Date(now.getTime() - 0.5 * 24 * 60 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' '),
    new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' '),
    new Date(now.getTime() - 1.5 * 24 * 60 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' '),
    new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' '),
    new Date(now.getTime() - 2.5 * 24 * 60 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' '),
    new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' '),
    new Date(now.getTime() - 0.25 * 24 * 60 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' ')
  ]

  const result: Post[] = []
  for (let i = 0; i < count; i++) {
    const idx = startIndex + i
    result.push({
      id: `${idx + 1}`,
      title: titles[idx % titles.length],
      content: contents[idx % contents.length],
      images: idx % 3 === 0 ? [
        `https://picsum.photos/400/300?random=${idx * 2}`,
        `https://picsum.photos/400/300?random=${idx * 2 + 1}`
      ] : idx % 2 === 0 ? [
        `https://picsum.photos/600/400?random=${idx}`
      ] : [],
      categoryId: `${(idx % 4) + 1}`,
      categoryName: categories[idx % categories.length],
      topics: ['前端开发', 'Vue3', 'JavaScript'].slice(0, (idx % 3) + 1),
      author: {
        id: `${(idx % 5) + 1}`,
        nickname: nicknames[idx % nicknames.length],
        avatar: avatars[idx % avatars.length]
      },
      isTop: idx === 0,
      isHot: idx < 3,
      viewsCount: viewsCounts[idx % viewsCounts.length],
      likesCount: likesCounts[idx % likesCounts.length],
      commentsCount: commentsCounts[idx % commentsCounts.length],
      collectionsCount: collectionsCounts[idx % collectionsCounts.length],
      isLiked: isLikedValues[idx % isLikedValues.length],
      isCollected: isCollectedValues[idx % isCollectedValues.length],
      status: 'published',
      createdAt: createdAtDates[idx % createdAtDates.length],
      updatedAt: createdAtDates[idx % createdAtDates.length]
    })
  }
  return result
}

const fetchPosts = async (sort: string, pageNum: number, size: number) => {
  try {
    const response = await postApi.getList({
      sort: sort as 'latest' | 'hot' | 'recommend',
      page: pageNum,
      pageSize: size
    })
    const data = response.data?.list || []
    if (data.length > 0) {
      return data
    }
  } catch (error) {
    console.warn('API 调用失败，使用 mock 数据:', error)
  }
  const startIndex = (pageNum - 1) * size
  return generateMockPosts(startIndex, size)
}

const fetchHotPosts = async () => {
  try {
    const response = await postApi.getHotList()
    const data = response.data?.slice(0, 5) || []
    if (data.length > 0) {
      return data
    }
  } catch (error) {
    console.warn('API 调用失败，使用 mock 数据:', error)
  }
  return generateMockPosts(0, 5)
}

const fetchHotTopics = async () => {
  const defaultTopics = [
    '前端开发',
    'Vue3',
    'TypeScript',
    'React',
    'JavaScript',
    'CSS动画',
    'Nuxt3',
    'Node.js',
    '开发工具',
    '面试经验'
  ]
  try {
    const response = await postApi.getTopics()
    const data = response.data || []
    if (data.length > 0) {
      return data
    }
  } catch (error) {
    console.warn('API 调用失败，使用 mock 数据:', error)
  }
  return defaultTopics
}

const { data: ssrPosts, refresh: refreshPosts } = await useAsyncData(
  'index-posts',
  () => fetchPosts(activeTab.value, 1, pageSize),
  {
    server: true
  }
)

const { data: ssrHotPosts } = await useAsyncData(
  'index-hot-posts',
  () => fetchHotPosts(),
  {
    server: true
  }
)

const { data: ssrHotTopics } = await useAsyncData(
  'index-hot-topics',
  () => fetchHotTopics(),
  {
    server: true
  }
)

const posts = useState<Post[]>('posts', () => ssrPosts.value || [])
const hotPosts = useState<Post[]>('hot-posts', () => ssrHotPosts.value || [])
const hotTopics = useState<string[]>('hot-topics', () => ssrHotTopics.value || [])

const navigateToPost = (postId: string) => {
  navigateTo(`/post/${postId}`)
}

const loadMore = async () => {
  if (loadingMore.value) return

  loadingMore.value = true
  try {
    const newPosts = await fetchPosts(activeTab.value, page.value + 1, pageSize)
    posts.value = [...posts.value, ...newPosts]
    page.value++
    hasMore.value = page.value < 3
  } catch (error) {
    console.error('加载更多失败:', error)
  } finally {
    loadingMore.value = false
  }
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
    console.warn('点赞 API 失败，使用本地更新:', error)
    if (post.isLiked) {
      post.isLiked = false
      post.likesCount = Math.max(0, post.likesCount - 1)
    } else {
      post.isLiked = true
      post.likesCount++
    }
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
    console.warn('收藏 API 失败，使用本地更新:', error)
    if (post.isCollected) {
      post.isCollected = false
      post.collectionsCount = Math.max(0, post.collectionsCount - 1)
    } else {
      post.isCollected = true
      post.collectionsCount++
    }
  }
}

watch(activeTab, async () => {
  isLoading.value = true
  try {
    page.value = 1
    hasMore.value = true
    posts.value = await fetchPosts(activeTab.value, 1, pageSize)
  } finally {
    isLoading.value = false
  }
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

.post-card-wrapper {
  cursor: pointer;
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
  cursor: pointer;
  transition: background 0.3s;

  &:hover {
    background: $bg-color;
  }

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
