import { defineNuxtRouteMiddleware, useRuntimeConfig } from 'nuxt/app'
import { useUserStore } from '~/stores/user'

export default defineNuxtRouteMiddleware((to) => {
  if (to.path.startsWith('/__nuxt_devtools__')) {
    return
  }
  const userStore = useUserStore()
  const config = useRuntimeConfig()

  if (typeof window !== 'undefined') {
    userStore.initAuth()
  }

  const publicPaths = ['/', '/login', '/register', '/forgot-password', '/categories', '/hot', '/search']
  const adminPaths = ['/admin/dashboard', '/admin/posts', '/admin/users', '/admin/categories', '/admin/reports', '/admin/logs']

  const isAuthRequired =
    to.path.startsWith('/create') ||
    to.path.startsWith('/user/profile') ||
    to.path.startsWith('/user/settings') ||
    to.path.startsWith('/notifications')

  const isAdminPath = adminPaths.some((p) => to.path.startsWith(p))

  if (isAuthRequired && !userStore.isLoggedIn) {
    return navigateTo('/login')
  }

  if (isAdminPath && to.path !== '/admin/login') {
    if (!userStore.isLoggedIn || !userStore.user?.isAdmin) {
      return navigateTo('/admin/login')
    }
  }
})
