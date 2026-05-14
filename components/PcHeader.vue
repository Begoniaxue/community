<template>
  <header class="pc-header">
    <div class="container">
      <div class="header-left">
        <NuxtLink to="/" class="logo">社区平台</NuxtLink>
        <nav class="nav-menu">
          <NuxtLink to="/" class="nav-item" exact-active-class="active">首页</NuxtLink>
          <NuxtLink to="/categories" class="nav-item" active-class="active">分类</NuxtLink>
          <NuxtLink to="/hot" class="nav-item" active-class="active">热榜</NuxtLink>
        </nav>
      </div>
      <div class="header-center">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索内容"
          prefix-icon="Search"
          @keyup.enter="handleSearch"
          style="width: 300px"
        />
      </div>
      <div class="header-right">
        <el-button type="primary" @click="handleCreatePost">发布内容</el-button>
        <el-dropdown @command="handleCommand">
          <div class="user-info">
            <el-avatar v-if="userStore.user" :src="userStore.user.avatar" size="32" />
            <el-icon v-else><User /></el-icon>
            <el-icon><ArrowDown /></el-icon>
          </div>
          <template #dropdown>
            <el-dropdown-menu>
              <template v-if="userStore.isLoggedIn">
                <el-dropdown-item command="profile">个人中心</el-dropdown-item>
                <el-dropdown-item command="notifications">消息中心</el-dropdown-item>
                <el-dropdown-item command="settings">设置</el-dropdown-item>
                <el-dropdown-item divided command="logout">退出登录</el-dropdown-item>
              </template>
              <template v-else>
                <el-dropdown-item command="login">登录</el-dropdown-item>
                <el-dropdown-item command="register">注册</el-dropdown-item>
              </template>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
        <el-badge :value="messageStore.unreadCount" :hidden="messageStore.unreadCount === 0">
          <el-icon class="message-icon" @click="navigateToNotifications"><Bell /></el-icon>
        </el-badge>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '~/stores/user'
import { useMessageStore } from '~/stores/message'
import { User, ArrowDown, Bell, Search } from '@element-plus/icons-vue'

const router = useRouter()
const userStore = useUserStore()
const messageStore = useMessageStore()

const searchKeyword = ref('')

const handleSearch = () => {
  if (searchKeyword.value.trim()) {
    router.push(`/search?q=${encodeURIComponent(searchKeyword.value)}`)
  }
}

const handleCreatePost = () => {
  if (!userStore.isLoggedIn) {
    router.push('/login')
    return
  }
  router.push('/create')
}

const handleCommand = (command: string) => {
  switch (command) {
    case 'profile':
      router.push('/user/profile')
      break
    case 'notifications':
      router.push('/notifications')
      break
    case 'settings':
      router.push('/user/settings')
      break
    case 'logout':
      userStore.logout()
      router.push('/')
      break
    case 'login':
      router.push('/login')
      break
    case 'register':
      router.push('/register')
      break
  }
}

const navigateToNotifications = () => {
  router.push('/notifications')
}
</script>

<style scoped lang="scss">
.pc-header {
  background: $white;
  box-shadow: $shadow-sm;
  position: sticky;
  top: 0;
  z-index: 100;

  .container {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 60px;
    padding: 0 $spacing-lg;
  }

  .header-left {
    display: flex;
    align-items: center;
    gap: $spacing-lg;
  }

  .logo {
    font-size: $font-size-lg;
    font-weight: bold;
    color: $primary-color;
  }

  .nav-menu {
    display: flex;
    gap: $spacing-lg;
  }

  .nav-item {
    color: $text-regular;
    font-size: $font-size-base;
    padding: $spacing-sm 0;
    border-bottom: 2px solid transparent;
    transition: all 0.3s;

    &:hover,
    &.active {
      color: $primary-color;
      border-bottom-color: $primary-color;
    }
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: $spacing-base;
  }

  .user-info {
    display: flex;
    align-items: center;
    gap: $spacing-xs;
    cursor: pointer;
    padding: $spacing-sm;
    border-radius: $border-radius-base;
    transition: background 0.3s;

    &:hover {
      background: $bg-color;
    }
  }

  .message-icon {
    font-size: 20px;
    cursor: pointer;
    color: $text-regular;

    &:hover {
      color: $primary-color;
    }
  }
}
</style>
