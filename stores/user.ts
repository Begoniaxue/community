import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface User {
  id: string
  username: string
  nickname: string
  avatar: string
  email: string
  phone: string
  bio: string
  gender: 'male' | 'female' | 'unknown'
  birthday: string
  location: string
  followersCount: number
  followingCount: number
  postsCount: number
  isAdmin: boolean
  isBanned: boolean
  createdAt: string
  updatedAt: string
}

export const useUserStore = defineStore('user', () => {
  const user = ref<User | null>(null)
  const token = ref<string>('')
  const isLoggedIn = computed(() => !!token.value)

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

  const initAuth = () => {
    if (typeof window !== 'undefined') {
      const savedToken = localStorage.getItem('community_token')
      if (savedToken) {
        token.value = savedToken
      }
    }
  }

  return {
    user,
    token,
    isLoggedIn,
    setUser,
    setToken,
    updateUser,
    logout,
    initAuth
  }
})
