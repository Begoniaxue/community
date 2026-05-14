<template>
  <div class="user-skeleton">
    <div class="skeleton-avatar skeleton" />
    <div class="skeleton-content">
      <div class="skeleton-name skeleton" />
      <div class="skeleton-bio skeleton" />
    </div>
    <div class="skeleton-btn skeleton" />
  </div>
</template>

<style scoped lang="scss">
.user-skeleton {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: $spacing-base;
  background: $white;
  border-radius: $border-radius-base;
}

.skeleton-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
}

.skeleton-content {
  flex: 1;
  margin: 0 $spacing-base;
  display: flex;
  flex-direction: column;
  gap: $spacing-xs;
}

.skeleton-name {
  width: 100px;
  height: 18px;
}

.skeleton-bio {
  width: 200px;
  height: 14px;
}

.skeleton-btn {
  width: 60px;
  height: 28px;
  border-radius: $border-radius-sm;
}
</style>
