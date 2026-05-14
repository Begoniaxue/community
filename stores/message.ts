import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface NotificationMessage {
  id: string
  type: 'like' | 'comment' | 'follow' | 'system'
  fromUser?: {
    id: string
    nickname: string
    avatar: string
  }
  content: string
  postId?: string
  postTitle?: string
  isRead: boolean
  createdAt: string
}

export const useMessageStore = defineStore('message', () => {
  const unreadCount = ref(0)
  const notifications = ref<NotificationMessage[]>([])
  const isConnected = ref(false)

  const setConnected = (connected: boolean) => {
    isConnected.value = connected
  }

  const incrementUnread = () => {
    unreadCount.value++
  }

  const setUnreadCount = (count: number) => {
    unreadCount.value = count
  }

  const addNotification = (message: NotificationMessage) => {
    notifications.value.unshift(message)
    if (!message.isRead) {
      incrementUnread()
    }
  }

  const markAsRead = (id: string) => {
    const message = notifications.value.find((m) => m.id === id)
    if (message && !message.isRead) {
      message.isRead = true
      unreadCount.value = Math.max(0, unreadCount.value - 1)
    }
  }

  const markAllAsRead = () => {
    notifications.value.forEach((m) => (m.isRead = true))
    unreadCount.value = 0
  }

  const clearNotifications = () => {
    notifications.value = []
    unreadCount.value = 0
  }

  return {
    unreadCount,
    notifications,
    isConnected,
    setConnected,
    incrementUnread,
    setUnreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    clearNotifications
  }
})
