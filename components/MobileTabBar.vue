<template>
  <van-tabbar v-model="activeTab" route>
    <van-tabbar-item to="/" icon="home-o">首页</van-tabbar-item>
    <van-tabbar-item to="/categories" icon="apps-o">分类</van-tabbar-item>
    <van-tabbar-item to="/create" icon="plus">发布</van-tabbar-item>
    <van-tabbar-item to="/notifications" icon="bell-o" :badge="messageStore.unreadCount || null">消息</van-tabbar-item>
    <van-tabbar-item to="/user/profile" icon="user-o">我的</van-tabbar-item>
  </van-tabbar>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useMessageStore } from '~/stores/message'

const messageStore = useMessageStore()
const activeTab = ref(0)
</script>

<style scoped>
:deep(.van-tabbar) {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 100;
}

main {
  padding-bottom: 50px;
}
</style>
