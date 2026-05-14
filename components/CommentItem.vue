<template>
  <div class="comment-item">
    <NuxtLink :to="`/user/${comment.user.id}`" class="avatar-link">
      <el-avatar :src="comment.user.avatar" size="40" />
    </NuxtLink>
    <div class="comment-content">
      <div class="comment-header">
        <NuxtLink :to="`/user/${comment.user.id}`" class="nickname">
          {{ comment.user.nickname }}
        </NuxtLink>
        <span v-if="comment.replyTo" class="reply-to">
          回复
          <NuxtLink :to="`/user/${comment.replyTo.id}`" class="reply-nickname">
            @{{ comment.replyTo.nickname }}
          </NuxtLink>
        </span>
        <span class="time">{{ formatTime(comment.createdAt) }}</span>
      </div>
      <div class="comment-text">{{ comment.content }}</div>
      <div class="comment-actions">
        <button
          class="action-btn"
          :class="{ active: comment.isLiked }"
          @click="handleLike"
        >
          <el-icon><thumb-up /></el-icon>
          <span>{{ formatNumber(comment.likesCount) }}</span>
        </button>
        <button class="action-btn" @click="handleReply">
          <el-icon><chat-dot-rounded /></el-icon>
          <span>回复</span>
        </button>
        <button v-if="canDelete" class="action-btn" @click="handleDelete">
          <el-icon><delete /></el-icon>
          <span>删除</span>
        </button>
      </div>

      <div v-if="comment.replies?.length" class="replies">
        <CommentItem
          v-for="reply in comment.replies"
          :key="reply.id"
          :comment="reply"
          @reply="$emit('reply', reply)"
          @like="$emit('like', reply)"
          @delete="$emit('delete', reply)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Comment } from '~/api/post'
import { useUserStore } from '~/stores/user'
import { formatTime, formatNumber } from '~/utils'
import { StarFilled, ChatRound, Delete } from '@element-plus/icons-vue'

const props = defineProps<{
  comment: Comment
}>()

const emit = defineEmits<{
  reply: [comment: Comment]
  like: [comment: Comment]
  delete: [comment: Comment]
}>()

const userStore = useUserStore()

const canDelete = computed(() => {
  if (!userStore.user) return false
  return userStore.user.id === props.comment.user.id || userStore.user.isAdmin
})

const handleLike = () => {
  emit('like', props.comment)
}

const handleReply = () => {
  emit('reply', props.comment)
}

const handleDelete = () => {
  emit('delete', props.comment)
}
</script>

<style scoped lang="scss">
.comment-item {
  display: flex;
  gap: $spacing-sm;
}

.avatar-link {
  flex-shrink: 0;
}

.comment-content {
  flex: 1;
  min-width: 0;
}

.comment-header {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  margin-bottom: $spacing-xs;
  flex-wrap: wrap;
}

.nickname {
  font-weight: 500;
  color: $primary-color;

  &:hover {
    text-decoration: underline;
  }
}

.reply-to {
  color: $text-secondary;
  font-size: $font-size-sm;
}

.reply-nickname {
  color: $primary-color;

  &:hover {
    text-decoration: underline;
  }
}

.time {
  color: $text-secondary;
  font-size: $font-size-xs;
}

.comment-text {
  color: $text-primary;
  line-height: 1.6;
  margin-bottom: $spacing-xs;
  word-break: break-word;
}

.comment-actions {
  display: flex;
  gap: $spacing-base;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 2px $spacing-xs;
  font-size: $font-size-xs;
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
    font-size: 14px;
  }
}

.replies {
  margin-top: $spacing-base;
  padding-left: $spacing-base;
  border-left: 2px solid $border-light;
}
</style>
