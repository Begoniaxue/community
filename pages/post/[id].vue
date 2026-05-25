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
                <el-icon><view /></el-icon>
                {{ formatNumber(post.viewsCount) }}
              </span>
            </div>

            <div class="post-content" v-html="post.content" />

            <div v-if="post.images && post.images.length" class="post-images">
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
                v-for="topic in (post.topics || [])"
                :key="topic"
                :to="`/topic/${topic}`"
                class="topic-tag"
              >
                #{{ topic }}
              </NuxtLink>
            </div>

            <div class="post-actions">
              <button class="action-btn" :class="{ active: post.isLiked }" @click="handleLike">
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
                <el-icon><chat-dot-round /></el-icon>
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

          <div id="comments" class="comments-section">
            <h3 class="section-title">评论 ({{ comments.length }})</h3>

            <div class="comment-form">
              <el-input
                v-model="commentText"
                type="textarea"
                :placeholder="replyTo ? `回复 @${replyTo.nickname}` : '写下你的评论...'"
                :rows="3"
              />
              <div class="form-actions">
                <el-button v-if="replyTo" text @click="cancelReply">取消回复</el-button>
                <el-button type="primary" :loading="submitting" @click="submitComment">
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
              <el-button v-if="!loadingMoreComments" type="primary" plain @click="loadMoreComments">
                加载更多评论
              </el-button>
              <el-button v-else loading type="primary" plain>加载中...</el-button>
            </div>
          </div>
        </div>

        <aside class="sidebar">
          <div v-if="post" class="sidebar-card author-card">
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
import { useRoute } from 'vue-router'
import { ref, watch, useAsyncData } from '#imports'
import type { Post, Comment } from '~/types'
import { postApi } from '~/api/post'
import { useUserStore } from '~/stores/user'
import { formatTime, formatNumber, copyToClipboard } from '~/utils'

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

const generateMockPost = (id: string): Post => {
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
    '<p>这是一篇关于前端开发的文章，包含了很多实用的技巧和经验分享。希望对大家有所帮助。</p><p>在这篇文章中，我将介绍一些常用的开发模式和最佳实践，帮助大家提高代码质量和开发效率。</p>',
    '<p>最近在学习新技术，遇到了一些问题，记录下来以便以后查阅。</p><p>学习过程中，我发现很多概念其实是相通的，只要掌握了核心思想，其他的都可以举一反三。</p>',
    '<p>分享一下我的开发经验，希望能帮助到更多的开发者。</p>',
    '<p>整理了一些常用的代码片段，收藏起来以后备用。</p>'
  ]
  const categories = ['技术', '生活', '学习', '娱乐']
  const nicknames = ['程序员小王', '前端小白', '代码达人', 'Vue爱好者', '全栈工程师']
  const idx = parseInt(id) % 10

  return {
    id,
    title: titles[idx],
    content: contents[idx % contents.length],
    images: idx % 3 === 0 ? [`https://picsum.photos/600/400?random=${idx * 2}`] : [],
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
    viewsCount: 1234 + idx * 100,
    likesCount: 123 + idx * 10,
    commentsCount: 45 + idx * 5,
    collectionsCount: 56 + idx * 8,
    isLiked: false,
    isCollected: false,
    status: 'published',
    createdAt: new Date().toISOString().slice(0, 19).replace('T', ' '),
    updatedAt: new Date().toISOString().slice(0, 19).replace('T', ' ')
  }
}

const generateMockComments = (): Comment[] => {
  const avatars = [
    'https://api.dicebear.com/7.x/avataaars/svg?seed=10',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=20',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=30'
  ]
  const nicknames = ['热心网友', '技术爱好者', '编程小白', '资深工程师', '架构师']
  const commentContents = [
    '写得太好了，学到了很多！',
    '感谢分享，这个方法很实用',
    '我也遇到过同样的问题，这样解决确实有效',
    '有没有更详细的代码示例可以参考一下？',
    '收藏了，以后慢慢看'
  ]

  return Array.from({ length: 5 }, (_, i) => ({
    id: `${i + 1}`,
    content: commentContents[i],
    user: {
      id: `${i + 100}`,
      nickname: nicknames[i % nicknames.length],
      avatar: avatars[i % avatars.length]
    },
    postId: route.params.id as string,
    parentId: null,
    likesCount: Math.floor(Math.random() * 50),
    replies: [],
    isLiked: false,
    createdAt: new Date(Date.now() - i * 3600000).toISOString().slice(0, 19).replace('T', ' ')
  }))
}

const fetchPost = async (id: string) => {
  try {
    const response = await postApi.getById(id)
    if (response.data) {
      return response.data
    }
  } catch (error) {
    console.warn('API 调用失败，使用 mock 数据:', error)
  }
  return generateMockPost(id)
}

const fetchComments = async (
  postId: string,
  pageNum: number,
  size: number = 10,
  isLoadMore = false
) => {
  if (isLoadMore) {
    loadingMoreComments.value = true
  } else {
    commentsLoading.value = true
  }

  try {
    const response = await postApi.getComments(postId, pageNum, size)
    const newComments = response.data?.list || []
    if (newComments.length > 0) {
      if (isLoadMore) {
        comments.value = [...comments.value, ...newComments]
      } else {
        comments.value = newComments
      }
      hasMoreComments.value = newComments.length === size
    } else {
      throw new Error('No comments')
    }
  } catch (error) {
    console.warn('评论 API 调用失败，使用 mock 数据:', error)
    if (!isLoadMore) {
      comments.value = generateMockComments()
    }
    hasMoreComments.value = false
  } finally {
    commentsLoading.value = false
    loadingMoreComments.value = false
  }
}

const postId = route.params.id as string

const { data: post, refresh: refreshPost } = await useAsyncData(
  `post-${postId}`,
  () => fetchPost(postId),
  {
    server: true
  }
)

if (post.value) {
  await fetchComments(postId, 1, 10)
}

const loadMoreComments = () => {
  commentPage.value++
  fetchComments(postId, commentPage.value, 10, true)
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
    console.warn('点赞 API 失败，使用本地更新:', error)
    if (post.value.isLiked) {
      post.value.isLiked = false
      post.value.likesCount = Math.max(0, post.value.likesCount - 1)
    } else {
      post.value.isLiked = true
      post.value.likesCount++
    }
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
    console.warn('收藏 API 失败，使用本地更新:', error)
    if (post.value.isCollected) {
      post.value.isCollected = false
      post.value.collectionsCount = Math.max(0, post.value.collectionsCount - 1)
    } else {
      post.value.isCollected = true
      post.value.collectionsCount++
    }
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
    console.warn('点赞评论 API 失败，使用本地更新:', error)
    if (comment.isLiked) {
      comment.isLiked = false
      comment.likesCount = Math.max(0, comment.likesCount - 1)
    } else {
      comment.isLiked = true
      comment.likesCount++
    }
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
  async (newId) => {
    if (newId) {
      await refreshPost()
      commentPage.value = 1
      comments.value = []
      await fetchComments(newId as string, 1, 10)
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
