<template>
  <div class="admin-layout">
    <el-container>
      <el-aside width="220px" class="admin-sidebar">
        <div class="logo">管理后台</div>
        <el-menu
          :default-active="activeMenu"
          router
          background-color="#304156"
          text-color="#bfcbd9"
          active-text-color="#409eff"
        >
          <el-menu-item index="/admin/dashboard">
            <el-icon><DataAnalysis /></el-icon>
            <span>数据看板</span>
          </el-menu-item>
          <el-menu-item index="/admin/posts">
            <el-icon><Document /></el-icon>
            <span>内容管理</span>
          </el-menu-item>
          <el-menu-item index="/admin/users">
            <el-icon><User /></el-icon>
            <span>用户管理</span>
          </el-menu-item>
          <el-menu-item index="/admin/categories">
            <el-icon><Folder /></el-icon>
            <span>分类管理</span>
          </el-menu-item>
          <el-menu-item index="/admin/reports">
            <el-icon><Warning /></el-icon>
            <span>举报管理</span>
          </el-menu-item>
          <el-menu-item index="/admin/logs">
            <el-icon><List /></el-icon>
            <span>操作日志</span>
          </el-menu-item>
        </el-menu>
      </el-aside>
      <el-container>
        <el-header class="admin-header">
          <div class="header-left">
            <el-breadcrumb separator="/">
              <el-breadcrumb-item :to="{ path: '/admin/dashboard' }">首页</el-breadcrumb-item>
              <el-breadcrumb-item>{{ currentPageTitle }}</el-breadcrumb-item>
            </el-breadcrumb>
          </div>
          <div class="header-right">
            <el-dropdown @command="handleCommand">
              <span class="user-info">
                <el-avatar :size="32" icon="UserFilled" />
                <span class="username">{{ adminUser?.username || '管理员' }}</span>
                <el-icon><ArrowDown /></el-icon>
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="logout">退出登录</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </el-header>
        <el-main class="admin-main">
          <slot />
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  DataAnalysis,
  Document,
  User,
  Folder,
  Warning,
  List,
  ArrowDown
} from '@element-plus/icons-vue'
import { useUserStore } from '~/stores/user'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const adminUser = computed(() => userStore.user)

const activeMenu = computed(() => route.path)

const pageTitleMap: Record<string, string> = {
  '/admin/dashboard': '数据看板',
  '/admin/posts': '内容管理',
  '/admin/users': '用户管理',
  '/admin/categories': '分类管理',
  '/admin/reports': '举报管理',
  '/admin/logs': '操作日志'
}

const currentPageTitle = computed(() => pageTitleMap[route.path] || '管理后台')

const handleCommand = (command: string) => {
  if (command === 'logout') {
    userStore.logout()
    router.push('/admin/login')
  }
}
</script>

<style scoped lang="scss">
.admin-layout {
  min-height: 100vh;
}

.admin-sidebar {
  background-color: #304156;
  height: 100vh;
  position: fixed;
  left: 0;
  top: 0;

  :deep(.el-menu) {
    border-right: none;
  }
}

.logo {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: $font-size-lg;
  font-weight: bold;
  color: $white;
  background-color: #2b3a4a;
}

.admin-header {
  background: $white;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 $spacing-lg;
  border-bottom: 1px solid $border-light;
  margin-left: 220px;
}

.admin-main {
  margin-left: 220px;
  background: $bg-color;
  padding: $spacing-lg;
}

.user-info {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  cursor: pointer;

  .username {
    font-size: $font-size-sm;
    color: $text-primary;
  }
}
</style>
