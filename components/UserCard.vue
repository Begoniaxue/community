<template>
  <div class="user-card">
    <NuxtLink :to="`/user/${user.id}`" class="user-info">
      <el-avatar :src="user.avatar" size="50" />
      <div class="user-meta">
        <h4 class="nickname">{{ user.nickname || user.username }}</h4>
        <p class="bio text-ellipsis">{{ user.bio || '这个人很懒，什么都没留下' }}</p>
      </div>
    </NuxtLink>
    <div class="user-actions">
      <el-button
        v-if="showFollow"
        type="primary"
        size="small"
        @click="handleFollow"
      >
        关注
      </el-button>
      <el-button
        v-else
        type="info"
        size="small"
        @click="handleUnfollow"
      >
        已关注
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { User } from '~/types'

const props = defineProps<{
  user: User
  showFollow?: boolean
}>()

const emit = defineEmits<{
  follow: [userId: number]
  unfollow: [userId: number]
}>()

const handleFollow = () => {
  emit('follow', props.user.id)
}

const handleUnfollow = () => {
  emit('unfollow', props.user.id)
}
</script>

<style scoped lang="scss">
.user-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: $spacing-base;
  background: $white;
  border-radius: $border-radius-base;
}

.user-info {
  display: flex;
  align-items: center;
  gap: $spacing-base;
  flex: 1;
  min-width: 0;
}

.user-meta {
  flex: 1;
  min-width: 0;

  .nickname {
    font-size: $font-size-base;
    font-weight: 500;
    color: $text-primary;
    margin-bottom: 4px;
  }

  .bio {
    font-size: $font-size-sm;
    color: $text-secondary;
  }
}

.user-actions {
  flex-shrink: 0;
}
</style>
