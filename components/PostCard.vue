<template>
  <article class="post-card">
    <div class="post-header">
      <NuxtLink :to="`/user/${post.author?.id}`" class="author-info">
        <el-avatar :src="post.author?.avatar" :size="40" />
        <div class="author-meta">
          <span class="author-name">{{ post.author?.nickname || '匿名用户' }}</span>
          <span class="post-time">{{ post.createdAt ? formatTime(post.createdAt) : '' }}</span>
        </div>
      </NuxtLink>
      <div class="post-tags">
        <el-tag v-if="post.isTop" type="danger" effect="light" size="small">置顶</el-tag>
        <el-tag v-if="post.isHot" type="warning" effect="light" size="small">热门</el-tag>
        <el-tag v-if="post.categoryName" size="small" type="info">{{ post.categoryName }}</el-tag>
      </div>
    </div>

    <NuxtLink :to="`/post/${post.id}`" class="post-content">
      <h3 class="post-title text-ellipsis-2">{{ post.title }}</h3>
      <p v-if="post.content" class="post-excerpt text-ellipsis-2">{{ stripHtml(post.content) }}</p>
      <div v-if="post.images && post.images.length" class="post-images">
        <img
          v-for="(img, index) in displayImages"
          :key="index"
          :src="img"
          class="post-image"
          loading="lazy"
        />
      </div>
    </NuxtLink>

    <div class="post-footer">
      <div class="topics">
        <NuxtLink
          v-for="topic in (post.topics || []).slice(0, 3)"
          :key="topic"
          :to="`/topic/${topic}`"
          class="topic-tag"
        >
          #{{ topic }}
        </NuxtLink>
      </div>
      <div class="actions">
        <button class="action-btn" :class="{ active: post.isLiked }" @click.stop="handleLike">
          <el-icon><chat-line-round /></el-icon>
          <span>{{ post.likesCount ? formatNumber(post.likesCount) : 0 }}</span>
        </button>
        <NuxtLink :to="`/post/${post.id}`" class="action-btn">
          <el-icon><chat-dot-round /></el-icon>
          <span>{{ post.commentsCount ? formatNumber(post.commentsCount) : 0 }}</span>
        </NuxtLink>
        <button class="action-btn" :class="{ active: post.isCollected }" @click.stop="handleCollect">
          <el-icon><star /></el-icon>
          <span>{{ post.collectionsCount ? formatNumber(post.collectionsCount) : 0 }}</span>
        </button>
        <el-dropdown @command="handleCommand">
          <button class="action-btn">
            <el-icon><more-filled /></el-icon>
          </button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="share">分享</el-dropdown-item>
              <el-dropdown-item command="report" divided>举报</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Post } from '~/types'
import { formatTime, formatNumber } from '~/utils'

const props = defineProps<{
  post: Post
}>()

const emit = defineEmits<{
  like: [post: Post]
  collect: [post: Post]
}>()

const displayImages = computed(() => (props.post.images || []).slice(0, 3))

const stripHtml = (html: string) => {
  return html.replace(/<[^>]+>/g, '')
}

const navigateToPost = () => {
  navigateTo(`/post/${props.post.id}`)
}

const handleLike = () => {
  emit('like', props.post)
}

const handleCollect = () => {
  emit('collect', props.post)
}

const handleCommand = (command: string) => {
  if (command === 'share') {
    // 分享逻辑
  } else if (command === 'report') {
    // 举报逻辑
  }
}
</script>

<style scoped lang="scss">
.post-card {
  background: $white;
  border-radius: $border-radius-base;
  padding: $spacing-base;
  box-shadow: $shadow-sm;
  transition: all 0.3s;

  &:hover {
    box-shadow: $shadow-base;
  }
}

.post-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: $spacing-base;
}

.author-info {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
}

.author-meta {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.author-name {
  font-size: $font-size-sm;
  font-weight: 500;
  color: $text-primary;
}

.post-time {
  font-size: $font-size-xs;
  color: $text-secondary;
}

.post-tags {
  display: flex;
  gap: $spacing-xs;
}

.post-content {
  display: block;
  margin-bottom: $spacing-base;
}

.post-title {
  font-size: $font-size-lg;
  font-weight: 600;
  color: $text-primary;
  margin-bottom: $spacing-sm;
  line-height: 1.4;
}

.post-excerpt {
  font-size: $font-size-sm;
  color: $text-regular;
  line-height: 1.6;
  margin-bottom: $spacing-sm;
}

.post-images {
  display: flex;
  gap: $spacing-sm;
  flex-wrap: wrap;
}

.post-image {
  width: calc((100% - 16px) / 3);
  aspect-ratio: 1;
  object-fit: cover;
  border-radius: $border-radius-sm;

  &:nth-child(1):last-child {
    width: 100%;
    max-width: 400px;
  }

  &:nth-child(1):nth-last-child(2),
  &:nth-child(2):last-child {
    width: calc((100% - 8px) / 2);
  }
}

.post-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: $spacing-sm;
  border-top: 1px solid $border-light;
}

.topics {
  display: flex;
  gap: $spacing-sm;
  flex-wrap: wrap;
}

.topic-tag {
  font-size: $font-size-xs;
  color: $primary-color;
  padding: 2px $spacing-xs;
  border-radius: $border-radius-sm;
  background: rgba(64, 158, 255, 0.1);

  &:hover {
    background: rgba(64, 158, 255, 0.2);
  }
}

.actions {
  display: flex;
  align-items: center;
  gap: $spacing-base;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: $spacing-xs;
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
    font-size: 16px;
  }
}
</style>
