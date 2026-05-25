import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User } from '~/types'
import { userApi } from '~/api/user'

export const useUserStore = defineStore('user', () => {
  const user = ref<User | null>(null)
  const token = ref<string>('')
  const isLoggedIn = computed(() => !!token.value)
  const isLoading = ref(false)

  const setUser = (userData: User) => {
    user.value = userData
  }

  const setToken = (tokenValue: string) => {
    token.value = tokenValue
    if (typeof window !== 'undefined') {
      localStorage.setItem('community_token', tokenValue)
    }
  }

  const updateUser = (userData: Partial<User>) => {
    if (user.value) {
      user.value = { ...user.value, ...userData }
    }
  }

  const logout = () => {
    user.value = null
    token.value = ''
    if (typeof window !== 'undefined') {
      localStorage.removeItem('community_token')
    }
  }

  const fetchUserInfo = async () => {
    if (!token.value) return
    isLoading.value = true
    try {
      const response = await userApi.getUserInfo()
      if (response.data) {
        user.value = response.data
      }
    } catch (error) {
      console.error('获取用户信息失败:', error)
    } finally {
      isLoading.value = false
    }
  }

  const initAuth = async () => {
    if (typeof window !== 'undefined') {
      const savedToken = localStorage.getItem('community_token')
      if (savedToken) {
        token.value = savedToken
        await fetchUserInfo()
      }
    }
  }

  return {
    user,
    token,
    isLoggedIn,
    isLoading,
    setUser,
    setToken,
    updateUser,
    logout,
    fetchUserInfo,
    initAuth
  }
})
