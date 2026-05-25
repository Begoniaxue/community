<template>
  <div class="categories-page">
    <div class="container">
      <h2 class="page-title">分类浏览</h2>

      <div class="categories-grid">
        <div
          v-for="category in categories"
          :key="category.id"
          class="category-card"
          @click="navigateToCategory(category.id)"
        >
          <div class="category-icon">{{ category.icon || '📁' }}</div>
          <div class="category-info">
            <h3 class="category-name">{{ category.name }}</h3>
            <p class="category-desc">{{ category.description || '暂无描述' }}</p>
            <span class="category-count">{{ category.postsCount || 0 }} 个帖子</span>
          </div>
        </div>
      </div>

      <h3 class="section-title">热门帖子</h3>

      <div v-if="loading" class="loading-skeleton">
        <PostCardSkeleton v-for="i in 5" :key="i" />
      </div>

      <div v-else-if="posts.length === 0" class="empty-state">
        <div class="empty-state__icon">📭</div>
        <div class="empty-state__text">暂无内容</div>
      </div>

      <div v-else class="posts-list">
        <PostCard
          v-for="post in posts"
          :key="post.id"
          :post="post"
          @like="handleLike"
          @collect="handleCollect"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { postApi } from '~/api/post'
import type { Post } from '~/types'
import { useUserStore } from '~/stores/user'

const router = useRouter()
const userStore = useUserStore()

const loading = ref(false)
const categories = ref<{ id: number; name: string; icon?: string; description?: string; postsCount?: number }[]>([])
const posts = ref<Post[]>([])

const extractArray = <T>(data: any): T[] => {
  if (Array.isArray(data)) return data
  if (data?.records && Array.isArray(data.records)) return data.records
  if (data?.list && Array.isArray(data.list)) return data.list
  return []
}

const fetchCategories = async () => {
  try {
    const response = await postApi.getCategories()
    console.log('[分类] fetchCategories 返回:', JSON.stringify(response, null, 2))
    categories.value = (response.data || []) as { id: number; name: string; icon?: string; description?: string; postsCount?: number }[]
  } catch (error) {
    console.error('获取分类失败:', error)
    categories.value = [
      { id: 1, name: '技术' },
      { id: 2, name: '生活' },
      { id: 3, name: '娱乐' },
      { id: 4, name: '学习' },
      { id: 5, name: '其他' }
    ]
  }
}

const fetchPosts = async () => {
  loading.value = true
  try {
    const response = await postApi.getList({ page: 1, pageSize: 10 })
    console.log('[分类] fetchPosts 返回:', JSON.stringify(response, null, 2))
    posts.value = extractArray<Post>(response.data)
  } catch (error) {
    console.error('获取帖子列表失败:', error)
  } finally {
    loading.value = false
  }
}

const navigateToCategory = (categoryId: number) => {
  router.push(`/?category=${categoryId}`)
}

const handleLike = async (post: Post) => {
  if (!userStore.isLoggedIn) {
    router.push('/login')
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
    console.error('点赞失败:', error)
  }
}

const handleCollect = async (post: Post) => {
  if (!userStore.isLoggedIn) {
    router.push('/login')
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
    console.error('收藏失败:', error)
  }
}

onMounted(() => {
  fetchPosts()
})
</script>

<style scoped lang="scss">
.categories-page {
  padding: $spacing-lg 0;
}

.page-title {
  font-size: $font-size-xl;
  font-weight: bold;
  margin-bottom: $spacing-xl;
}

.section-title {
  font-size: $font-size-lg;
  font-weight: bold;
  margin: $spacing-xl 0 $spacing-lg;
}

.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: $spacing-base;
  margin-bottom: $spacing-xl;
}

.category-card {
  background: $white;
  border-radius: $border-radius-base;
  padding: $spacing-lg;
  display: flex;
  align-items: center;
  gap: $spacing-base;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: $shadow-sm;

  &:hover {
    transform: translateY(-2px);
    box-shadow: $shadow-base;
  }
}

.category-icon {
  font-size: 40px;
  flex-shrink: 0;
}

.category-info {
  flex: 1;
  min-width: 0;
}

.category-name {
  font-size: $font-size-lg;
  font-weight: 600;
  margin-bottom: $spacing-xs;
}

.category-desc {
  font-size: $font-size-sm;
  color: $text-secondary;
  margin-bottom: $spacing-xs;
}

.category-count {
  font-size: $font-size-xs;
  color: $primary-color;
}

.posts-list {
  display: flex;
  flex-direction: column;
  gap: $spacing-base;
}

.loading-skeleton {
  display: flex;
  flex-direction: column;
  gap: $spacing-base;
}
</style>
