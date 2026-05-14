<template>
  <div class="notifications-page">
    <div class="container">
      <div class="notifications-card">
        <div class="page-header">
          <h2 class="page-title">消息中心</h2>
          <el-button type="text" @click="handleMarkAllRead" :disabled="!hasUnread">
            全部已读
          </el-button>
        </div>

        <div class="tabs-wrapper">
          <el-tabs v-model="activeTab">
            <el-tab-pane label="全部" name="all" />
            <el-tab-pane label="点赞" name="like" />
            <el-tab-pane label="评论" name="comment" />
            <el-tab-pane label="关注" name="follow" />
            <el-tab-pane label="系统" name="system" />
          </el-tabs>
        </div>

        <div v-if="loading" class="loading-skeleton">
          <NotificationSkeleton v-for="i in 5" :key="i" />
        </div>

        <div v-else-if="filteredNotifications.length === 0" class="empty-state">
          <div class="empty-state__icon">🔔</div>
          <div class="empty-state__text">暂无消息</div>
        </div>

        <div v-else class="notifications-list">
          <div
            v-for="notification in filteredNotifications"
            :key="notification.id"
            class="notification-item"
            :class="{ unread: !notification.isRead }"
            @click="handleClick(notification)"
          >
            <div class="notification-icon">
              <el-icon v-if="notification.type === 'like'" size="24"><StarFilled /></el-icon>
              <el-icon v-else-if="notification.type === 'comment'" size="24"><ChatDotRound /></el-icon>
              <el-icon v-else-if="notification.type === 'follow'" size="24"><UserFilled /></el-icon>
              <el-icon v-else size="24"><Bell /></el-icon>
            </div>
            <div class="notification-content">
              <div class="notification-header">
                <span v-if="notification.fromUser" class="from-user">
                <el-avatar :src="notification.fromUser.avatar" size="24" />
                <span>{{ notification.fromUser.nickname }}</span>
              </span>
              <span class="notification-time">{{ formatTime(notification.createdAt) }}</span>
            </div>
              <p class="notification-text">{{ notification.content }}</p>
              <NuxtLink
                v-if="notification.postTitle"
                :to="`/post/${notification.postId}`"
                class="post-link"
              >
                {{ notification.postTitle }}
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useMessageStore } from '~/stores/message'
import type { NotificationMessage } from '~/stores/message'
import { formatTime } from '~/utils'

const messageStore = useMessageStore()

const activeTab = ref('all')
const loading = ref(true)

const filteredNotifications = computed(() => {
  if (activeTab.value === 'all') {
    return messageStore.notifications
  }
  return messageStore.notifications.filter((n) => n.type === activeTab.value)
})

const hasUnread = computed(() => messageStore.notifications.some((n) => !n.isRead))

const handleClick = (notification: NotificationMessage) => {
  if (!notification.isRead) {
    messageStore.markAsRead(notification.id)
  }
}

const handleMarkAllRead = () => {
  messageStore.markAllAsRead()
}

onMounted(() => {
  loading.value = false
})
</script>

<style scoped lang="scss">
.notifications-page {
  padding: $spacing-lg 0;
}

.notifications-card {
  background: $white;
  border-radius: $border-radius-base;
  padding: $spacing-xl;
  max-width: 800px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: $spacing-base;
  padding-bottom: $spacing-base;
  border-bottom: 1px solid $border-light;
}

.page-title {
  font-size: $font-size-xl;
  font-weight: bold;
}

.tabs-wrapper {
  margin-bottom: $spacing-lg;

  :deep(.el-tabs__header) {
    margin: 0;
  }
}

.notifications-list {
  display: flex;
  flex-direction: column;
  gap: $spacing-base;
}

.notification-item {
  display: flex;
  gap: $spacing-base;
  padding: $spacing-base;
  border-radius: $border-radius-base;
  cursor: pointer;
  transition: background 0.3s;

  &:hover {
    background: $bg-color;
  }

  &.unread {
    background: rgba(64, 158, 255, 0.05);
    border-left: 3px solid $primary-color;
  }
}

.notification-icon {
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: $bg-color;
  display: flex;
  align-items: center;
  justify-content: center;
  color: $primary-color;
}

.notification-content {
  flex: 1;
  min-width: 0;
}

.notification-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: $spacing-xs;
}

.from-user {
  display: flex;
  align-items: center;
  gap: $spacing-xs;
  font-weight: 500;
}

.notification-time {
  font-size: $font-size-xs;
  color: $text-secondary;
}

.notification-text {
  color: $text-regular;
  margin-bottom: $spacing-xs;
}

.post-link {
  font-size: $font-size-sm;
  color: $text-secondary;
  background: $bg-color;
  padding: 4px $spacing-sm;
  border-radius: $border-radius-sm;
  display: inline-block;

  &:hover {
    color: $primary-color;
  }
}

.loading-skeleton {
  display: flex;
  flex-direction: column;
  gap: $spacing-base;
}
</style>
