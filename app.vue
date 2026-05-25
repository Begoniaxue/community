<template>
  <div id="app">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useUserStore } from '~/stores/user'

const userStore = useUserStore()

onMounted(async () => {
  await userStore.initAuth()
})
</script>

<style>
#app {
  min-height: 100vh;
}
</style>
