<template>
  <div class="user-page">
    <div class="container">
      <div class="profile-header">
        <el-avatar :src="profileUser?.avatar" size="100" />
        <div class="profile-info">
          <h2 class="nickname">{{ profileUser?.nickname || profileUser?.username }}</h2>
          <p class="bio">{{ profileUser?.bio || '这个人很懒，什么都没留下' }}</p>
          <div class="stats">
            <div class="stat-item">
              <span class="stat-value">{{ profileUser?.postsCount || 0 }}</span>
              <span class="stat-label">帖子</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">{{ profileUser?.followingCount || 0 }}</span>
              <span class="stat-label">关注</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">{{ profileUser?.followersCount || 0 }}</span>
              <span class="stat-label">粉丝</span>
            </div>
          </div>
        </div>
        <div class="profile-actions">
          <el-button
            v-if="isOwnProfile"
            type="primary"
            @click="navigateToSettings"
          >
            编辑资料
          </el-button>
          <el-button
            v-else
            :type="isFollowing ? 'info' : 'primary'"
            @click="handleFollow"
          >
            {{ isFollowing ? '已关注' : '关注' }}
          </el-button>
        </div>
      </div>

      <div class="profile-content">
        <div v-if="postsLoading" class="loading-skeleton">
          <PostCardSkeleton v-for="i in 3" :key="i" />
        </div>
        <div v-else-if="userPosts.length === 0" class="empty-state">
          <div class="empty-state__icon">📝</div>
          <div class="empty-state__text">暂无帖子</div>
        </div>
        <div v-else class="posts-list">
          <PostCard
            v-for="post in userPosts"
            :key="post.id"
            :post="post"
            @like="handleLike"
            @collect="handleCollect"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import type { Post } from '~/api/post'
import { postApi } from '~/api/post'
import { userApi } from '~/api/user'
import type { User } from '~/stores/user'
import { useUserStore } from '~/stores/user'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const profileUser = ref<User | null>(null)
const userPosts = ref<Post[]>([])
const postsLoading = ref(false)
const isFollowing = ref(false)

const userId = computed(() => route.params.id as string)
const isOwnProfile = computed(() => userStore.user?.id === userId.value)

const fetchUserProfile = async () => {
  try {
    const response = await userApi.getUserById(userId.value)
    profileUser.value = response.data || null
  } catch (error) {
    console.error('获取用户信息失败:', error)
  }
}

const fetchUserPosts = async () => {
  postsLoading.value = true
  try {
    const response = await postApi.getList({ page: 1, pageSize: 20 })
    userPosts.value = response.data?.list || []
  } catch (error) {
    console.error('获取用户帖子失败:', error)
  } finally {
    postsLoading.value = false
  }
}

const handleFollow = async () => {
  if (!userStore.isLoggedIn) {
    router.push('/login')
    return
  }

  try {
    if (isFollowing.value) {
      await userApi.unfollowUser(userId.value)
      isFollowing.value = false
      ElMessage.success('已取消关注')
    } else {
      await userApi.followUser(userId.value)
      isFollowing.value = true
      ElMessage.success('关注成功')
    }
  } catch (error) {
    console.error('关注操作失败:', error)
  }
}

const navigateToSettings = () => {
  router.push('/user/settings')
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

watch(
  () => route.params.id,
  () => {
    fetchUserProfile()
    fetchUserPosts()
  }
)

onMounted(() => {
  fetchUserProfile()
  fetchUserPosts()
})
</script>

<style scoped lang="scss">
.user-page {
  padding: $spacing-lg 0;
}

.profile-header {
  background: $white;
  border-radius: $border-radius-base;
  padding: $spacing-xl;
  display: flex;
  align-items: center;
  gap: $spacing-xl;
  margin-bottom: $spacing-lg;
}

.profile-info {
  flex: 1;

  .nickname {
    font-size: $font-size-xl;
    font-weight: bold;
    margin-bottom: $spacing-sm;
  }

  .bio {
    color: $text-secondary;
    margin-bottom: $spacing-base;
  }
}

.stats {
  display: flex;
  gap: $spacing-xl;

  .stat-item {
    display: flex;
    flex-direction: column;
    align-items: center;

    .stat-value {
      font-size: $font-size-lg;
      font-weight: bold;
      color: $text-primary;
    }

    .stat-label {
      font-size: $font-size-sm;
      color: $text-secondary;
    }
  }
}

.profile-content {
  background: $white;
  border-radius: $border-radius-base;
  padding: $spacing-base;
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
