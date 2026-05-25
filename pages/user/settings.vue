<template>
  <div class="settings-page">
    <div class="container">
      <div class="settings-card">
        <h2 class="page-title">编辑资料</h2>

        <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
          <el-form-item label="头像">
            <div class="avatar-upload">
              <el-avatar :src="form.avatar || defaultAvatar" :size="100" />
              <div class="avatar-actions">
                <el-button type="primary" size="small" @click="triggerAvatarInput">
                  更换头像
                </el-button>
                <input
                  ref="avatarInputRef"
                  type="file"
                  accept="image/*"
                  style="display: none"
                  @change="handleAvatarChange"
                />
              </div>
            </div>
          </el-form-item>

          <el-form-item label="昵称" prop="nickname">
            <el-input v-model="form.nickname" placeholder="请输入昵称" maxlength="20" />
          </el-form-item>

          <el-form-item label="性别" prop="gender">
            <el-radio-group v-model="form.gender">
              <el-radio :label="1">男</el-radio>
              <el-radio :label="2">女</el-radio>
              <el-radio :label="0">保密</el-radio>
            </el-radio-group>
          </el-form-item>

          <el-form-item label="生日" prop="birthday">
            <el-date-picker
              v-model="form.birthday"
              type="date"
              placeholder="请选择生日"
              style="width: 100%"
              value-format="YYYY-MM-DD"
            />
          </el-form-item>

          <el-form-item label="所在地" prop="location">
            <el-input v-model="form.location" placeholder="请输入所在地" maxlength="50" />
          </el-form-item>

          <el-form-item label="个人简介" prop="bio">
            <el-input
              v-model="form.bio"
              type="textarea"
              :rows="4"
              placeholder="介绍一下自己吧..."
              maxlength="200"
              show-word-limit
            />
          </el-form-item>

          <el-form-item>
            <el-button type="primary" :loading="submitting" @click="handleSubmit">
              保存修改
            </el-button>
            <el-button @click="handleCancel">取消</el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import type { FormInstance, FormRules, UploadFile } from 'element-plus'
import { useUserStore } from '~/stores/user'
import { userApi } from '~/api/user'
import type { UpdateProfileParams } from '~/api/user'

const router = useRouter()
const userStore = useUserStore()

const formRef = ref<FormInstance>()
const avatarInputRef = ref<HTMLInputElement>()
const submitting = ref(false)
const defaultAvatar = 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'

const form = reactive({
  nickname: '',
  avatar: '',
  gender: 0 as 0 | 1 | 2,
  birthday: '',
  location: '',
  bio: ''
})

const rules: FormRules = {
  nickname: [
    { required: true, message: '请输入昵称', trigger: 'blur' },
    { min: 2, max: 20, message: '昵称长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  bio: [
    { max: 200, message: '个人简介不能超过 200 个字符', trigger: 'blur' }
  ]
}

const initForm = () => {
  if (userStore.user) {
    form.nickname = userStore.user.nickname || ''
    form.avatar = userStore.user.avatar || ''
    form.gender = userStore.user.gender || 0
    form.birthday = userStore.user.birthday || ''
    form.location = userStore.user.location || ''
    form.bio = userStore.user.bio || ''
  }
}

const triggerAvatarInput = () => {
  avatarInputRef.value?.click()
}

const handleAvatarChange = async (e: Event) => {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  try {
    const res = await userApi.uploadAvatar(file)
    if (res.data?.avatar) {
      form.avatar = res.data.avatar
      userStore.updateUser({ avatar: res.data.avatar })
      ElMessage.success('头像上传成功')
    }
  } catch (error) {
    console.error('头像上传失败:', error)
  } finally {
    target.value = ''
  }
}

const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    submitting.value = true

    const params: UpdateProfileParams = {
      nickname: form.nickname,
      gender: form.gender,
      birthday: form.birthday || undefined,
      location: form.location || undefined,
      bio: form.bio || undefined
    }

    const res = await userApi.updateUserInfo(params)
    if (res.data) {
      userStore.updateUser(res.data)
      ElMessage.success('保存成功')
      router.push('/user/profile')
    }
  } catch (error: any) {
    if (error?.message) {
      ElMessage.error(error.message)
    }
  } finally {
    submitting.value = false
  }
}

const handleCancel = () => {
  router.push('/user/profile')
}

onMounted(() => {
  if (!userStore.isLoggedIn) {
    router.push('/login')
    return
  }
  initForm()
})
</script>

<style scoped lang="scss">
.settings-page {
  padding: $spacing-lg 0;
}

.settings-card {
  background: $white;
  border-radius: $border-radius-base;
  padding: $spacing-xl;
  max-width: 600px;
  margin: 0 auto;
}

.page-title {
  font-size: $font-size-xl;
  font-weight: bold;
  margin-bottom: $spacing-xl;
  color: $text-primary;
}

.avatar-upload {
  display: flex;
  align-items: center;
  gap: $spacing-lg;
}

.avatar-actions {
  display: flex;
  flex-direction: column;
  gap: $spacing-sm;
}
</style>
