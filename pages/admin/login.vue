<template>
  <div class="admin-login-page">
    <div class="login-container">
      <div class="login-card">
        <h2 class="login-title">管理后台登录</h2>
        <el-form ref="formRef" :model="form" :rules="rules" label-position="top">
          <el-form-item label="用户名" prop="username">
            <el-input v-model="form.username" placeholder="请输入管理员用户名" />
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <el-input
              v-model="form.password"
              type="password"
              placeholder="请输入密码"
              show-password
            />
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
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import type { FormInstance, FormRules } from 'element-plus'
import { adminApi } from '~/api/admin'
import { useUserStore } from '~/stores/user'

const router = useRouter()
const userStore = useUserStore()

const formRef = ref<FormInstance>()
const loading = ref(false)

const form = reactive({
  username: '',
  password: ''
})

const rules: FormRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}

const handleLogin = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    loading.value = true

    const response = await adminApi.login(form.username, form.password)

    if (response.data?.token) {
      userStore.setToken(response.data.token)
      if (response.data?.user) {
        userStore.setUser(response.data.user)
      }
      router.push('/admin/dashboard')
    }
  } catch (error: any) {
    if (error?.message) {
      ElMessage.error(error.message)
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped lang="scss">
.admin-login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
}

.login-container {
  width: 100%;
  max-width: 400px;
  padding: $spacing-base;
}

.login-card {
  background: $white;
  border-radius: $border-radius-lg;
  padding: $spacing-xl;
  box-shadow: $shadow-base;
}

.login-title {
  text-align: center;
  font-size: $font-size-xl;
  font-weight: bold;
  margin-bottom: $spacing-xl;
  color: $text-primary;
}
</style>
