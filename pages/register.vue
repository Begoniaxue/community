<template>
  <div class="auth-page">
    <div class="auth-container">
      <div class="auth-card">
        <h2 class="auth-title">注册</h2>
        <el-form ref="formRef" :model="form" :rules="rules" label-position="top">
          <el-form-item label="用户名" prop="username">
            <el-input v-model="form.username" placeholder="请输入用户名" />
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="form.email" placeholder="请输入邮箱" />
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <el-input
              v-model="form.password"
              type="password"
              placeholder="请输入密码"
              show-password
            />
          </el-form-item>
          <el-form-item label="确认密码" prop="confirmPassword">
            <el-input
              v-model="form.confirmPassword"
              type="password"
              placeholder="请再次输入密码"
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
              :loading="loading"
              style="width: 100%"
              @click="handleRegister"
            >
              注册
            </el-button>
          </el-form-item>
        </el-form>
        <div class="auth-links">
          <NuxtLink to="/login">已有账号？立即登录</NuxtLink>
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

const router = useRouter()

const formRef = ref<FormInstance>()
const loading = ref(false)
const captchaImage = ref('')

const form = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  captcha: ''
})

const validatePassword = (rule: any, value: string, callback: any) => {
  if (!value) {
    callback(new Error('请输入密码'))
  } else if (value.length < 6) {
    callback(new Error('密码长度至少6位'))
  } else {
    callback()
  }
}

const validateConfirmPassword = (rule: any, value: string, callback: any) => {
  if (!value) {
    callback(new Error('请再次输入密码'))
  } else if (value !== form.password) {
    callback(new Error('两次输入密码不一致'))
  } else {
    callback()
  }
}

const rules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度在 3 到 20 个字符', trigger: 'blur' },
    {
      pattern: /^[a-zA-Z0-9_]+$/,
      message: '用户名只能包含字母、数字和下划线',
      trigger: 'blur'
    }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  password: [{ validator: validatePassword, trigger: 'blur' }],
  confirmPassword: [{ validator: validateConfirmPassword, trigger: 'blur' }],
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

const handleRegister = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    loading.value = true

    const response = await userApi.register({
      username: form.username,
      email: form.email,
      password: form.password,
      confirmPassword: form.confirmPassword,
      captcha: form.captcha
    })

    if (response.data?.token) {
      ElMessage.success('注册成功')
      router.push('/login')
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
  text-align: center;
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
