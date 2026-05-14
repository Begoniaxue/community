<template>
  <div class="auth-page">
    <div class="auth-container">
      <div class="auth-card">
        <h2 class="auth-title">登录</h2>
        <el-form ref="formRef" :model="form" :rules="rules" label-position="top">
          <el-form-item label="用户名" prop="username">
            <el-input v-model="form.username" placeholder="请输入用户名" />
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <el-input
              v-model="form.password"
              type="password"
              placeholder="请输入密码"
              show-password
            />
          </el-form-item>
          <el-form-item label="验证码" prop="captcha">
            <div class="captcha-row">
              <el-input v-model="form.captcha" placeholder="请输入验证码" />
              <div class="captcha-image" @click="refreshCaptcha">
                <img v-if="captchaImage" :src="captchaImage" alt="验证码" />
                <span v-else>点击刷新</span>
              </div>
            </div>
          </el-form-item>
          <el-form-item>
            <el-button
              type="primary"
              @click="handleLogin"
              :loading="loading"
              style="width: 100%"
            >
              登录
            </el-button>
          </el-form-item>
        </el-form>
        <div class="auth-links">
          <NuxtLink to="/register">还没有账号？立即注册</NuxtLink>
          <NuxtLink to="/forgot-password">忘记密码？</NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import type { FormInstance, FormRules } from 'element-plus'
import { userApi } from '~/api/user'
import { useUserStore } from '~/stores/user'

const router = useRouter()
const userStore = useUserStore()

const formRef = ref<FormInstance>()
const loading = ref(false)
const captchaImage = ref('')

const form = reactive({
  username: '',
  password: '',
  captcha: ''
})

const rules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' }
  ],
  captcha: [{ required: true, message: '请输入验证码', trigger: 'blur' }]
}

const refreshCaptcha = async () => {
  try {
    const response = await userApi.getCaptcha()
    captchaImage.value = response.data?.image || ''
  } catch (error) {
    console.error('获取验证码失败:', error)
  }
}

const handleLogin = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    loading.value = true

    const response = await userApi.login({
      username: form.username,
      password: form.password
    })

    if (response.data?.token) {
      userStore.setToken(response.data.token)
      if (response.data?.user) {
        userStore.setUser(response.data.user)
      }
      router.push('/')
    }
  } catch (error: any) {
    if (error?.message) {
      ElMessage.error(error.message)
    }
    refreshCaptcha()
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  refreshCaptcha()
})
</script>

<style scoped lang="scss">
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: $spacing-base;
}

.auth-container {
  width: 100%;
  max-width: 400px;
}

.auth-card {
  background: $white;
  border-radius: $border-radius-lg;
  padding: $spacing-xl;
  box-shadow: $shadow-base;
}

.auth-title {
  text-align: center;
  font-size: $font-size-xl;
  font-weight: bold;
  margin-bottom: $spacing-xl;
  color: $text-primary;
}

.captcha-row {
  display: flex;
  gap: $spacing-sm;
}

.captcha-row .el-input {
  flex: 1;
}

.captcha-image {
  width: 120px;
  height: 40px;
  background: $bg-color;
  border-radius: $border-radius-sm;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  overflow: hidden;
  border: 1px solid $border-color;
  flex-shrink: 0;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  span {
    font-size: $font-size-sm;
    color: $text-secondary;
  }
}

.auth-links {
  display: flex;
  justify-content: space-between;
  margin-top: $spacing-base;
  font-size: $font-size-sm;

  a {
    color: $primary-color;

    &:hover {
      text-decoration: underline;
    }
  }
}
</style>
