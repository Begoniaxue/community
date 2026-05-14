<template>
  <div class="profile-page">
    <div class="container">
      <div class="profile-header">
        <div class="profile-avatar">
          <el-avatar :src="user?.avatar" size="100" />
          <div class="avatar-upload" @click="handleAvatarUpload">
            <el-icon><Camera /></el-icon>
          </div>
          <input
            ref="avatarInputRef"
            type="file"
            accept="image/*"
            style="display: none"
            @change="handleAvatarChange"
          />
        </div>
        <div class="profile-info">
          <h2 class="nickname">{{ user?.nickname || user?.username }}</h2>
          <p class="bio">{{ user?.bio || '这个人很懒，什么都没留下' }}</p>
          <div class="stats">
            <div class="stat-item">
              <span class="stat-value">{{ user?.postsCount || 0 }}</span>
              <span class="stat-label">帖子</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">{{ user?.followingCount || 0 }}</span>
              <span class="stat-label">关注</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">{{ user?.followersCount || 0 }}</span>
              <span class="stat-label">粉丝</span>
            </div>
          </div>
        </div>
        <div class="profile-actions">
          <el-button type="primary" @click="navigateToSettings">编辑资料</el-button>
        </div>
      </div>

      <div class="profile-content">
        <el-tabs v-model="activeTab" class="profile-tabs">
          <el-tab-pane label="我的帖子" name="posts">
            <div v-if="postsLoading" class="loading-skeleton">
              <PostCardSkeleton v-for="i in 3" :key="i" />
            </div>
            <div v-else-if="myPosts.length === 0" class="empty-state">
              <div class="empty-state__icon">📝</div>
              <div class="empty-state__text">暂无帖子</div>
            </div>
            <div v-else class="posts-list">
              <PostCard
                v-for="post in myPosts"
                :key="post.id"
                :post="post"
                @like="handleLike"
                @collect="handleCollect"
              />
            </div>
          </el-tab-pane>

          <el-tab-pane label="我的收藏" name="collections">
            <div v-if="collectionsLoading" class="loading-skeleton">
              <PostCardSkeleton v-for="i in 3" :key="i" />
            </div>
            <div v-else-if="myCollections.length === 0" class="empty-state">
              <div class="empty-state__icon">⭐</div>
              <div class="empty-state__text">暂无收藏</div>
            </div>
            <div v-else class="posts-list">
              <PostCard
                v-for="post in myCollections"
                :key="post.id"
                :post="post"
                @like="handleLike"
                @collect="handleCollect"
              />
            </div>
          </el-tab-pane>

          <el-tab-pane label="关注" name="following">
            <div v-if="followingLoading" class="loading-skeleton">
              <UserSkeleton v-for="i in 5" :key="i" />
            </div>
            <div v-else-if="following.length === 0" class="empty-state">
              <div class="empty-state__icon">👥</div>
              <div class="empty-state__text">暂无关注</div>
            </div>
            <div v-else class="users-list">
              <UserCard
                v-for="item in following"
                :key="item.id"
                :user="item"
                @unfollow="handleUnfollow"
              />
            </div>
          </el-tab-pane>

          <el-tab-pane label="粉丝" name="followers">
            <div v-if="followersLoading" class="loading-skeleton">
              <UserSkeleton v-for="i in 5" :key="i" />
            </div>
            <div v-else-if="followers.length === 0" class="empty-state">
              <div class="empty-state__icon">👥</div>
              <div class="empty-state__text">暂无粉丝</div>
            </div>
            <div v-else class="users-list">
              <UserCard
                v-for="item in followers"
                :key="item.id"
                :user="item"
                :showFollow="true"
                @follow="handleFollow"
              />
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import type { Post } from '~/api/post'
import { postApi } from '~/api/post'
import { userApi } from '~/api/user'
import type { User } from '~/stores/user'
import { useUserStore } from '~/stores/user'
import { Camera } from '@element-plus/icons-vue'

const router = useRouter()
const userStore = useUserStore()

const activeTab = ref('posts')
const avatarInputRef = ref<HTMLInputElement>()
const myPosts = ref<Post[]>([])
const myCollections = ref<Post[]>([])
const following = ref<User[]>([])
const followers = ref<User[]>([])
const postsLoading = ref(false)
const collectionsLoading = ref(false)
const followingLoading = ref(false)
const followersLoading = ref(false)

const user = computed(() => userStore.user)

const fetchMyPosts = async () => {
  postsLoading.value = true
  try {
    const response = await userApi.getMyPosts(1, 20)
    myPosts.value = response.data?.list || []
  } catch (error) {
    console.error('获取我的帖子失败:', error)
  } finally {
    postsLoading.value = false
  }
}

const fetchMyCollections = async () => {
  collectionsLoading.value = true
  try {
    const response = await userApi.getMyCollections(1, 20)
    myCollections.value = response.data?.list || []
  } catch (error) {
    console.error('获取我的收藏失败:', error)
  } finally {
    collectionsLoading.value = false
  }
}

const fetchFollowing = async () => {
  if (!user.value) return
  followingLoading.value = true
  try {
    const response = await userApi.getFollowing(user.value.id, 1, 20)
    following.value = response.data?.list || []
  } catch (error) {
    console.error('获取关注列表失败:', error)
  } finally {
    followingLoading.value = false
  }
}

const fetchFollowers = async () => {
  if (!user.value) return
  followersLoading.value = true
  try {
    const response = await userApi.getFollowers(user.value.id, 1, 20)
    followers.value = response.data?.list || []
  } catch (error) {
    console.error('获取粉丝列表失败:', error)
  } finally {
    followersLoading.value = false
  }
}

const handleAvatarUpload = () => {
  avatarInputRef.value?.click()
}

const handleAvatarChange = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  try {
    const response = await userApi.uploadAvatar(file)
    if (response.data?.url) {
      userStore.updateUser({ avatar: response.data.url })
      ElMessage.success('头像更新成功')
    }
  } catch (error) {
    console.error('上传头像失败:', error)
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

const handleFollow = async (userId: string) => {
  try {
    await userApi.followUser(userId)
    ElMessage.success('关注成功')
  } catch (error) {
    console.error('关注失败:', error)
  }
}

const handleUnfollow = async (userId: string) => {
  try {
    await userApi.unfollowUser(userId)
    following.value = following.value.filter((u) => u.id !== userId)
    ElMessage.success('已取消关注')
  } catch (error) {
    console.error('取消关注失败:', error)
  }
}

watch(activeTab, (tab) => {
  switch (tab) {
    case 'posts':
      fetchMyPosts()
      break
    case 'collections':
      fetchMyCollections()
      break
    case 'following':
      fetchFollowing()
      break
    case 'followers':
      fetchFollowers()
      break
  }
})

onMounted(() => {
  fetchMyPosts()
})
</script>

<style scoped lang="scss">
.profile-page {
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
  position: relative;
}

.profile-avatar {
  position: relative;

  .avatar-upload {
    position: absolute;
    bottom: 0;
    right: 0;
    width: 32px;
    height: 32px;
    background: $primary-color;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: $white;
    cursor: pointer;
    border: 2px solid $white;
  }
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

  :deep(.el-tabs__header) {
    margin-bottom: $spacing-base;
  }
}

.posts-list,
.users-list {
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
