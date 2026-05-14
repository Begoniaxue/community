<template>
  <div class="layout-default">
    <ClientOnly>
      <PcHeader v-if="!isMobile" />
      <MobileHeader v-else />
    </ClientOnly>
    <main class="main-content">
      <slot />
    </main>
    <ClientOnly>
      <Footer v-if="!isMobile" />
      <MobileTabBar v-else />
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { isMobile as checkMobile } from '~/utils'

const isMobile = ref(false)

onMounted(() => {
  isMobile.value = checkMobile()
})
</script>

<style scoped lang="scss">
.layout-default {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
}
</style>
