<template>
  <div class="post-detail-page">
    <div class="container">
      <div class="content-wrapper">
        <div class="main-content">
          <div v-if="!post" class="empty-state">
            <div class="empty-state__icon">📭</div>
            <div class="empty-state__text">帖子不存在或已被删除</div>
          </div>

          <div v-else class="post-detail">
            <h1 class="post-title">{{ post.title }}</h1>
            <div class="post-meta">
              <NuxtLink :to="`/user/${post.author.id}`" class="author">
                <el-avatar :src="post.author.avatar" size="32" />
                <span>{{ post.author.nickname }}</span>
              </NuxtLink>
              <span class="post-time">{{ formatTime(post.createdAt) }}</span>
              <span class="category">{{ post.categoryName }}</span>
              <span class="views">
                <el-icon><View /></el-icon>
                {{ formatNumber(post.viewsCount) }}
              </span>
            </div>

            <div class="post-content" v-html="post.content" />

            <div v-if="post.images.length" class="post-images">
              <el-image
                v-for="(img, index) in post.images"
                :key="index"
                :src="img"
                :preview-src-list="post.images"
                :initial-index="index"
                fit="cover"
                class="post-image"
              />
            </div>

            <div class="topics">
              <NuxtLink
                v-for="topic in post.topics"
                :key="topic"
                :to="`/topic/${topic}`"
                class="topic-tag"
              >
                #{{ topic }}
              </NuxtLink>
            </div>

            <div class="post-actions">
              <button
                class="action-btn"
                :class="{ active: post.isLiked }"
                @click="handleLike"
              >
                <el-icon><thumb-up /></el-icon>
                <span>{{ formatNumber(post.likesCount) }}</span>
              </button>
              <button
                class="action-btn"
                :class="{ active: post.isCollected }"
                @click="handleCollect"
              >
                <el-icon><star /></el-icon>
                <span>{{ formatNumber(post.collectionsCount) }}</span>
              </button>
              <button class="action-btn" @click="scrollToComments">
                <el-icon><chat-dot-rounded /></el-icon>
                <span>{{ formatNumber(post.commentsCount) }}</span>
              </button>
              <el-dropdown @command="handleCommand">
                <button class="action-btn">
                  <el-icon><share /></el-icon>
                  <span>分享</span>
                </button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item command="share">复制链接</el-dropdown-item>
                    <el-dropdown-item command="report" divided>举报</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </div>

          <div class="comments-section" id="comments">
            <h3 class="section-title">评论 ({{ comments.length }})</h3>

            <div class="comment-form">
              <el-input
                v-model="commentText"
                type="textarea"
                :placeholder="replyTo ? `回复 @${replyTo.nickname}` : '写下你的评论...'"
                :rows="3"
              />
              <div class="form-actions">
                <el-button v-if="replyTo" @click="cancelReply" text>取消回复</el-button>
                <el-button type="primary" @click="submitComment" :loading="submitting">
                  发表评论
                </el-button>
              </div>
            </div>

            <div v-if="commentsLoading" class="comments-skeleton">
              <div v-for="i in 3" :key="i" class="comment-skeleton">
                <div class="skeleton-avatar skeleton" />
                <div class="skeleton-content">
                  <div class="skeleton-name skeleton" />
                  <div class="skeleton-text skeleton" />
                </div>
              </div>
            </div>

            <div v-else-if="comments.length === 0" class="empty-state">
              <div class="empty-state__icon">💬</div>
              <div class="empty-state__text">暂无评论，快来抢沙发吧</div>
            </div>

            <div v-else class="comments-list">
              <CommentItem
                v-for="comment in comments"
                :key="comment.id"
                :comment="comment"
                @reply="handleReply"
                @like="handleLikeComment"
                @delete="handleDeleteComment"
              />
            </div>

            <div v-if="hasMoreComments" class="load-more">
              <el-button
                v-if="!loadingMoreComments"
                @click="loadMoreComments"
                type="primary"
                plain
              >
                加载更多评论
              </el-button>
              <el-button v-else loading type="primary" plain>加载中...</el-button>
            </div>
          </div>
        </div>

        <aside class="sidebar">
          <div class="sidebar-card author-card" v-if="post">
            <div class="author-info">
              <el-avatar :src="post.author.avatar" size="60" />
              <div class="author-meta">
                <h4>{{ post.author.nickname }}</h4>
                <div class="stats">
                  <span>帖子 {{ post.author.postsCount || 0 }}</span>
                  <span>粉丝 {{ post.author.followersCount || 0 }}</span>
                </div>
              </div>
            </div>
            <el-button type="primary" block>关注</el-button>
          </div>
        </aside>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, useAsyncData } from '#imports'
import { useRoute } from 'vue-router'
import type { Post, Comment } from '~/api/post'
import { postApi } from '~/api/post'
import { useUserStore } from '~/stores/user'
import { formatTime, formatNumber, copyToClipboard } from '~/utils'
import { StarFilled, Star, ChatRound, Share, View } from '@element-plus/icons-vue'

const route = useRoute()
const userStore = useUserStore()

const comments = ref<Comment[]>([])
const commentsLoading = ref(false)
const commentText = ref('')
const submitting = ref(false)
const replyTo = ref<{ id: string; nickname: string } | null>(null)
const commentPage = ref(1)
const hasMoreComments = ref(true)
const loadingMoreComments = ref(false)

const fetchPost = async (id: string) => {
  try {
    const response = await postApi.getById(id)
    return response.data || null
  } catch (error) {
    console.error('获取帖子详情失败:', error)
    return null
  }
}

const fetchComments = async (postId: string, pageNum: number, size: number = 10, isLoadMore = false) => {
  if (isLoadMore) {
    loadingMoreComments.value = true
  } else {
    commentsLoading.value = true
  }

  try {
    const response = await postApi.getComments(postId, pageNum, size)
    const newComments = response.data?.list || []
    if (isLoadMore) {
      comments.value = [...comments.value, ...newComments]
    } else {
      comments.value = newComments
    }
    hasMoreComments.value = newComments.length === size
  } catch (error) {
    console.error('获取评论失败:', error)
  } finally {
    commentsLoading.value = false
    loadingMoreComments.value = false
  }
}

const { data: post, refresh: refreshPost } = await useAsyncData(
  () => `post-${route.params.id}`,
  () => fetchPost(route.params.id as string),
  {
    server: true
  }
)

if (post.value) {
  await fetchComments(route.params.id as string, 1, 10)
}

const loadMoreComments = () => {
  commentPage.value++
  fetchComments(route.params.id as string, commentPage.value, 10, true)
}

const handleLike = async () => {
  if (!userStore.isLoggedIn) {
    navigateTo('/login')
    return
  }
  if (!post.value) return

  try {
    if (post.value.isLiked) {
      await postApi.unlike(post.value.id)
      post.value.isLiked = false
      post.value.likesCount = Math.max(0, post.value.likesCount - 1)
    } else {
      await postApi.like(post.value.id)
      post.value.isLiked = true
      post.value.likesCount++
    }
  } catch (error) {
    console.error('点赞失败:', error)
  }
}

const handleCollect = async () => {
  if (!userStore.isLoggedIn) {
    navigateTo('/login')
    return
  }
  if (!post.value) return

  try {
    if (post.value.isCollected) {
      await postApi.uncollect(post.value.id)
      post.value.isCollected = false
      post.value.collectionsCount = Math.max(0, post.value.collectionsCount - 1)
    } else {
      await postApi.collect(post.value.id)
      post.value.isCollected = true
      post.value.collectionsCount++
    }
  } catch (error) {
    console.error('收藏失败:', error)
  }
}

const submitComment = async () => {
  if (!userStore.isLoggedIn) {
    navigateTo('/login')
    return
  }
  if (!commentText.value.trim() || !post.value) return

  submitting.value = true
  try {
    await postApi.createComment(
      post.value.id,
      commentText.value,
      replyTo.value?.id,
      replyTo.value?.id
    )
    commentText.value = ''
    replyTo.value = null
    commentPage.value = 1
    fetchComments(post.value.id, 1, 10)
    ElMessage.success('评论成功')
  } catch (error) {
    console.error('评论失败:', error)
  } finally {
    submitting.value = false
  }
}

const handleReply = (comment: Comment) => {
  replyTo.value = { id: comment.id, nickname: comment.user.nickname }
}

const cancelReply = () => {
  replyTo.value = null
}

const handleLikeComment = async (comment: Comment) => {
  if (!userStore.isLoggedIn) {
    navigateTo('/login')
    return
  }

  try {
    if (comment.isLiked) {
      await postApi.unlikeComment(comment.id)
      comment.isLiked = false
      comment.likesCount = Math.max(0, comment.likesCount - 1)
    } else {
      await postApi.likeComment(comment.id)
      comment.isLiked = true
      comment.likesCount++
    }
  } catch (error) {
    console.error('点赞评论失败:', error)
  }
}

const handleDeleteComment = async (comment: Comment) => {
  try {
    await ElMessageBox.confirm('确定要删除这条评论吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await postApi.deleteComment(comment.id)
    comments.value = comments.value.filter((c) => c.id !== comment.id)
    ElMessage.success('删除成功')
  } catch (error) {
    console.error('删除评论失败:', error)
  }
}

const scrollToComments = () => {
  const element = document.getElementById('comments')
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' })
  }
}

const handleCommand = async (command: string) => {
  if (command === 'share') {
    const success = await copyToClipboard(window.location.href)
    if (success) {
      ElMessage.success('链接已复制到剪贴板')
    }
  } else if (command === 'report') {
    // 举报逻辑
  }
}

watch(
  () => route.params.id,
  async () => {
    await refreshPost()
    commentPage.value = 1
    comments.value = []
    if (post.value) {
      await fetchComments(route.params.id as string, 1, 10)
    }
  }
)
</script>

<style scoped lang="scss">
.post-detail-page {
  padding: $spacing-lg 0;
}

.content-wrapper {
  display: flex;
  gap: $spacing-lg;
}

.main-content {
  flex: 1;
  min-width: 0;
}

.post-detail {
  background: $white;
  border-radius: $border-radius-base;
  padding: $spacing-xl;
  margin-bottom: $spacing-base;
}

.post-title {
  font-size: 24px;
  font-weight: bold;
  color: $text-primary;
  margin-bottom: $spacing-base;
  line-height: 1.4;
}

.post-meta {
  display: flex;
  align-items: center;
  gap: $spacing-base;
  padding-bottom: $spacing-base;
  border-bottom: 1px solid $border-light;
  margin-bottom: $spacing-base;
  font-size: $font-size-sm;
  color: $text-secondary;

  .author {
    display: flex;
    align-items: center;
    gap: $spacing-xs;

    span {
      color: $text-primary;
      font-weight: 500;
    }

    &:hover span {
      color: $primary-color;
    }
  }

  .views {
    display: flex;
    align-items: center;
    gap: 4px;
  }
}

.post-content {
  font-size: $font-size-base;
  line-height: 1.8;
  color: $text-primary;
  margin-bottom: $spacing-base;

  :deep(img) {
    max-width: 100%;
    border-radius: $border-radius-sm;
  }

  :deep(p) {
    margin-bottom: $spacing-base;
  }
}

.post-images {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: $spacing-sm;
  margin-bottom: $spacing-base;
}

.post-image {
  aspect-ratio: 1;
  border-radius: $border-radius-sm;
  overflow: hidden;
  cursor: pointer;
}

.topics {
  display: flex;
  gap: $spacing-sm;
  flex-wrap: wrap;
  margin-bottom: $spacing-base;
}

.topic-tag {
  font-size: $font-size-sm;
  color: $primary-color;
  padding: 4px $spacing-sm;
  border-radius: $border-radius-sm;
  background: rgba(64, 158, 255, 0.1);

  &:hover {
    background: rgba(64, 158, 255, 0.2);
  }
}

.post-actions {
  display: flex;
  gap: $spacing-lg;
  padding-top: $spacing-base;
  border-top: 1px solid $border-light;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: $spacing-sm $spacing-base;
  font-size: $font-size-sm;
  color: $text-secondary;
  background: none;
  border: none;
  cursor: pointer;
  border-radius: $border-radius-sm;
  transition: all 0.3s;

  &:hover,
  &.active {
    color: $primary-color;
    background: rgba(64, 158, 255, 0.1);
  }

  .el-icon {
    font-size: 18px;
  }
}

.comments-section {
  background: $white;
  border-radius: $border-radius-base;
  padding: $spacing-xl;
}

.section-title {
  font-size: $font-size-lg;
  font-weight: bold;
  margin-bottom: $spacing-lg;
  padding-bottom: $spacing-sm;
  border-bottom: 1px solid $border-light;
}

.comment-form {
  margin-bottom: $spacing-lg;

  .form-actions {
    display: flex;
    justify-content: flex-end;
    gap: $spacing-sm;
    margin-top: $spacing-sm;
  }
}

.comments-list {
  display: flex;
  flex-direction: column;
  gap: $spacing-lg;
}

.load-more {
  text-align: center;
  padding-top: $spacing-lg;
}

.sidebar {
  width: 300px;
  flex-shrink: 0;
}

.sidebar-card {
  background: $white;
  border-radius: $border-radius-base;
  padding: $spacing-base;
}

.author-card {
  .author-info {
    display: flex;
    gap: $spacing-base;
    margin-bottom: $spacing-base;
  }

  .author-meta {
    flex: 1;

    h4 {
      font-size: $font-size-base;
      font-weight: bold;
      margin-bottom: $spacing-xs;
    }

    .stats {
      font-size: $font-size-xs;
      color: $text-secondary;
      display: flex;
      gap: $spacing-base;
    }
  }
}

.comments-skeleton {
  display: flex;
  flex-direction: column;
  gap: $spacing-lg;
}

.comment-skeleton {
  display: flex;
  gap: $spacing-sm;
}

.skeleton-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  flex-shrink: 0;
}

.skeleton-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: $spacing-xs;
}

.skeleton-name {
  width: 80px;
  height: 16px;
}

.skeleton-text {
  width: 100%;
  height: 40px;
}

@media (max-width: 768px) {
  .content-wrapper {
    flex-direction: column;
  }

  .sidebar {
    width: 100%;
  }

  .post-detail {
    padding: $spacing-base;
  }

  .post-title {
    font-size: $font-size-lg;
  }
}
</style>
