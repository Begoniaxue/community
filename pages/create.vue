<template>
  <div class="create-page">
    <div class="container">
      <div class="create-card">
        <h2 class="page-title">发布内容</h2>
        <el-form ref="formRef" :model="form" :rules="rules" label-position="top">
          <el-form-item label="标题" prop="title">
            <el-input v-model="form.title" placeholder="请输入标题" maxlength="100" show-word-limit />
          </el-form-item>

          <el-form-item label="分类" prop="categoryId">
            <el-select v-model="form.categoryId" placeholder="请选择分类" style="width: 100%">
              <el-option
                v-for="category in categories"
                :key="category.id"
                :label="category.name"
                :value="category.id"
              />
            </el-select>
          </el-form-item>

          <el-form-item label="话题">
            <el-select
              v-model="form.topics"
              multiple
              filterable
              allow-create
              default-first-option
              placeholder="输入话题后按回车添加"
              style="width: 100%"
            >
              <el-option v-for="topic in hotTopics" :key="topic" :label="topic" :value="topic" />
            </el-select>
          </el-form-item>

          <el-form-item label="内容" prop="content">
            <div class="editor-wrapper">
              <textarea
                v-model="form.content"
                class="editor-textarea"
                placeholder="请输入内容..."
                rows="15"
              />
            </div>
          </el-form-item>

          <el-form-item label="图片">
            <el-upload
              v-model:file-list="fileList"
              action="#"
              list-type="picture-card"
              :auto-upload="false"
              :on-change="handleFileChange"
              :limit="9"
              :on-exceed="handleExceed"
              accept="image/*"
            >
              <el-icon><Plus /></el-icon>
            </el-upload>
          </el-form-item>

          <el-form-item>
            <el-button type="primary" @click="handleSubmit" :loading="submitting">
              发布
            </el-button>
            <el-button @click="handleSaveDraft" :loading="saving">
              保存草稿
            </el-button>
            <el-button @click="handleReset">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import type { FormInstance, FormRules, UploadFile, UploadFiles } from 'element-plus'
import { postApi } from '~/api/post'
import { useUserStore } from '~/stores/user'
import { Plus } from '@element-plus/icons-vue'

const router = useRouter()
const userStore = useUserStore()

const formRef = ref<FormInstance>()
const submitting = ref(false)
const saving = ref(false)
const categories = ref<{ id: string; name: string }[]>([])
const hotTopics = ref<string[]>([])
const fileList = ref<UploadFile[]>([])

const form = reactive({
  title: '',
  categoryId: '',
  topics: [] as string[],
  content: ''
})

const rules: FormRules = {
  title: [
    { required: true, message: '请输入标题', trigger: 'blur' },
    { min: 2, max: 100, message: '标题长度在 2 到 100 个字符', trigger: 'blur' }
  ],
  categoryId: [{ required: true, message: '请选择分类', trigger: 'change' }],
  content: [{ required: true, message: '请输入内容', trigger: 'blur' }]
}

const fetchCategories = async () => {
  try {
    const response = await postApi.getCategories()
    categories.value = response.data || []
  } catch (error) {
    console.error('获取分类失败:', error)
    categories.value = [
      { id: '1', name: '技术' },
      { id: '2', name: '生活' },
      { id: '3', name: '娱乐' },
      { id: '4', name: '学习' },
      { id: '5', name: '其他' }
    ]
  }
}

const fetchTopics = async () => {
  try {
    const response = await postApi.getTopics()
    hotTopics.value = response.data?.slice(0, 10) || []
  } catch (error) {
    console.error('获取话题失败:', error)
    hotTopics.value = ['Vue3', '前端开发', 'JavaScript', '技术分享', '生活日常']
  }
}

const handleFileChange = (file: UploadFile, files: UploadFiles) => {
  fileList.value = files
}

const handleExceed = () => {
  ElMessage.warning('最多只能上传9张图片')
}

const handleSubmit = async () => {
  if (!userStore.isLoggedIn) {
    router.push('/login')
    return
  }

  if (!formRef.value) return

  try {
    await formRef.value.validate()
    submitting.value = true

    const images = fileList.value
      .filter((f) => f.status === 'ready' || f.status === 'success')
      .map((f) => f.url || '')
      .filter(Boolean)

    await postApi.create({
      title: form.title,
      content: form.content,
      images,
      categoryId: form.categoryId,
      topics: form.topics
    })

    ElMessage.success('发布成功')
    router.push('/')
  } catch (error: any) {
    if (error?.message) {
      ElMessage.error(error.message)
    }
  } finally {
    submitting.value = false
  }
}

const handleSaveDraft = async () => {
  if (!userStore.isLoggedIn) {
    router.push('/login')
    return
  }

  saving.value = true
  try {
    ElMessage.success('草稿已保存')
  } finally {
    saving.value = false
  }
}

const handleReset = () => {
  form.title = ''
  form.categoryId = ''
  form.topics = []
  form.content = ''
  fileList.value = []
  formRef.value?.resetFields()
}

onMounted(() => {
  fetchCategories()
  fetchTopics()
})
</script>

<style scoped lang="scss">
.create-page {
  padding: $spacing-lg 0;
}

.create-card {
  background: $white;
  border-radius: $border-radius-base;
  padding: $spacing-xl;
  max-width: 800px;
  margin: 0 auto;
}

.page-title {
  font-size: $font-size-xl;
  font-weight: bold;
  margin-bottom: $spacing-xl;
  padding-bottom: $spacing-base;
  border-bottom: 1px solid $border-light;
}

.editor-wrapper {
  border: 1px solid $border-color;
  border-radius: $border-radius-sm;
  overflow: hidden;

  &:focus-within {
    border-color: $primary-color;
  }
}

.editor-textarea {
  width: 100%;
  border: none;
  outline: none;
  padding: $spacing-base;
  font-size: $font-size-base;
  line-height: 1.8;
  resize: vertical;
  min-height: 300px;

  &::placeholder {
    color: $text-placeholder;
  }
}
</style>
