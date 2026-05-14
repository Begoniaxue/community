<template>
  <header class="mobile-header">
    <div class="header-left">
      <NuxtLink to="/" class="logo">社区</NuxtLink>
    </div>
    <div class="header-center">
      <van-search v-model="searchKeyword" placeholder="搜索" @search="handleSearch" />
    </div>
    <div class="header-right">
      <van-badge :content="messageStore.unreadCount" :show-zero="false">
        <van-icon name="bell-o" @click="navigateToNotifications" />
      </van-badge>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useMessageStore } from '~/stores/message'

const router = useRouter()
const messageStore = useMessageStore()

const searchKeyword = ref('')

const handleSearch = () => {
  if (searchKeyword.value.trim()) {
    router.push(`/search?q=${encodeURIComponent(searchKeyword.value)}`)
  }
}

const navigateToNotifications = () => {
  router.push('/notifications')
}
</script>

<style scoped lang="scss">
.mobile-header {
  background: $white;
  box-shadow: $shadow-sm;
  position: sticky;
  top: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  padding: $spacing-sm $spacing-base;
  gap: $spacing-sm;

  .header-left .logo {
    font-size: $font-size-base;
    font-weight: bold;
    color: $primary-color;
    white-space: nowrap;
  }

  .header-center {
    flex: 1;

    :deep(.van-search) {
      padding: 0;
      background: transparent;
    }
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: $spacing-sm;

    .van-icon {
      font-size: 1.2rem;
      color: $text-regular;
      cursor: pointer;
    }
  }
}
</style>
