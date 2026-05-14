<template>
  <div class="post-card-skeleton">
    <div class="skeleton-header">
      <div class="skeleton-avatar skeleton" />
      <div class="skeleton-author">
        <div class="skeleton-name skeleton" />
        <div class="skeleton-time skeleton" />
      </div>
    </div>
    <div class="skeleton-content">
      <div class="skeleton-title skeleton" />
      <div class="skeleton-excerpt skeleton" />
      <div class="skeleton-images">
        <div class="skeleton-image skeleton" v-for="i in 3" :key="i" />
      </div>
    </div>
    <div class="skeleton-footer">
      <div class="skeleton-actions">
        <div class="skeleton-action skeleton" v-for="i in 4" :key="i" />
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.post-card-skeleton {
  background: $white;
  border-radius: $border-radius-base;
  padding: $spacing-base;
}

.skeleton-header {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  margin-bottom: $spacing-base;
}

.skeleton-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
}

.skeleton-author {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: $spacing-xs;
}

.skeleton-name {
  width: 80px;
  height: 16px;
}

.skeleton-time {
  width: 60px;
  height: 12px;
}

.skeleton-content {
  margin-bottom: $spacing-base;
  display: flex;
  flex-direction: column;
  gap: $spacing-sm;
}

.skeleton-title {
  width: 80%;
  height: 20px;
}

.skeleton-excerpt {
  width: 100%;
  height: 16px;
}

.skeleton-images {
  display: flex;
  gap: $spacing-sm;
}

.skeleton-image {
  width: calc((100% - 16px) / 3);
  aspect-ratio: 1;
}

.skeleton-footer {
  padding-top: $spacing-sm;
  border-top: 1px solid $border-light;
}

.skeleton-actions {
  display: flex;
  gap: $spacing-base;
}

.skeleton-action {
  width: 50px;
  height: 20px;
}
</style>
