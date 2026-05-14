<template>
  <footer class="footer">
    <div class="container">
      <div class="footer-content">
        <div class="footer-section">
          <h4>关于我们</h4>
          <p>社区平台 - 一个分享知识和交流的地方</p>
        </div>
        <div class="footer-section">
          <h4>帮助中心</h4>
          <ul>
            <li><NuxtLink to="/help">使用指南</NuxtLink></li>
            <li><NuxtLink to="/about">关于我们</NuxtLink></li>
            <li><NuxtLink to="/contact">联系我们</NuxtLink></li>
          </ul>
        </div>
        <div class="footer-section">
          <h4>友情链接</h4>
          <ul>
            <li><a href="#">合作伙伴</a></li>
            <li><a href="#">开发者API</a></li>
          </ul>
        </div>
      </div>
      <div class="footer-bottom">
        <p>&copy; 2024 社区平台 版权所有</p>
      </div>
    </div>
  </footer>
</template>

<style scoped lang="scss">
.footer {
  background: $white;
  border-top: 1px solid $border-light;
  padding: $spacing-xl 0;
  margin-top: $spacing-xl;

  .footer-content {
    display: flex;
    justify-content: space-between;
    gap: $spacing-lg;
    flex-wrap: wrap;
  }

  .footer-section {
    flex: 1;
    min-width: 200px;

    h4 {
      font-size: $font-size-base;
      font-weight: bold;
      margin-bottom: $spacing-base;
      color: $text-primary;
    }

    p {
      color: $text-secondary;
      line-height: 1.6;
    }

    ul {
      list-style: none;

      li {
        margin-bottom: $spacing-sm;

        a {
          color: $text-secondary;
          transition: color 0.3s;

          &:hover {
            color: $primary-color;
          }
        }
      }
    }
  }

  .footer-bottom {
    text-align: center;
    padding-top: $spacing-lg;
    margin-top: $spacing-lg;
    border-top: 1px solid $border-light;
    color: $text-secondary;
    font-size: $font-size-sm;
  }
}
</style>
