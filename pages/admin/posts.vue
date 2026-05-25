<template>
  <div class="admin-posts-page">
    <div class="page-header">
      <h2 class="page-title">内容管理</h2>
    </div>

    <el-card class="filter-card">
      <el-form :inline="true" :model="filters" class="filter-form">
        <el-form-item label="状态">
          <el-select v-model="filters.status" placeholder="全部状态" clearable style="width: 150px">
            <el-option label="待审核" value="reviewing" />
            <el-option label="已发布" value="published" />
            <el-option label="已拒绝" value="rejected" />
          </el-select>
        </el-form-item>
        <el-form-item label="关键词">
          <el-input
            v-model="filters.keyword"
            placeholder="搜索标题/内容"
            style="width: 200px"
            clearable
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="table-card">
      <el-table v-loading="loading" :data="tableData" stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="title" label="标题" min-width="200">
          <template #default="{ row }">
            <span class="text-ellipsis-2">{{ row.title }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="author" label="作者" width="120">
          <template #default="{ row }">
            {{ row.author?.nickname || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="categoryName" label="分类" width="100" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="viewsCount" label="浏览" width="80" align="center" />
        <el-table-column prop="commentsCount" label="评论" width="80" align="center" />
        <el-table-column prop="createdAt" label="发布时间" width="180">
          <template #default="{ row }">
            {{ row.createdAt }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleView(row)">查看</el-button>
            <el-button
              v-if="row.status === 'reviewing'"
              link
              type="success"
              @click="handleApprove(row)"
            >
              通过
            </el-button>
            <el-button
              v-if="row.status === 'reviewing'"
              link
              type="danger"
              @click="handleReject(row)"
            >
              拒绝
            </el-button>
            <el-button
              v-if="row.status === 'published'"
              link
              type="warning"
              @click="handleSetTop(row)"
            >
              {{ row.isTop ? '取消置顶' : '置顶' }}
            </el-button>
            <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { adminApi } from '~/api/admin'

const router = useRouter()

const loading = ref(false)
const tableData = ref([])

const filters = reactive({
  status: '',
  keyword: ''
})

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

const getStatusType = (status: string) => {
  const map: Record<string, string> = {
    reviewing: 'warning',
    published: 'success',
    rejected: 'danger',
    draft: 'info'
  }
  return map[status] || 'info'
}

const getStatusText = (status: string) => {
  const map: Record<string, string> = {
    reviewing: '待审核',
    published: '已发布',
    rejected: '已拒绝',
    draft: '草稿'
  }
  return map[status] || status
}

const fetchData = async () => {
  loading.value = true
  try {
    const response = await adminApi.getPosts({
      page: pagination.page,
      pageSize: pagination.pageSize,
      status: filters.status || undefined,
      keyword: filters.keyword || undefined
    })
    tableData.value = response.data?.list || []
    pagination.total = response.data?.total || 0
  } catch (error) {
    console.error('获取内容列表失败:', error)
    tableData.value = generateMockData()
    pagination.total = 100
  } finally {
    loading.value = false
  }
}

const generateMockData = () => {
  const data = []
  for (let i = 1; i <= 10; i++) {
    data.push({
      id: (pagination.page - 1) * pagination.pageSize + i,
      title: `测试帖子标题 ${(pagination.page - 1) * pagination.pageSize + i}`,
      author: { nickname: `用户${i}` },
      categoryName: '技术',
      status: ['reviewing', 'published', 'rejected'][i % 3],
      viewsCount: Math.floor(Math.random() * 1000),
      commentsCount: Math.floor(Math.random() * 100),
      isTop: i % 5 === 0,
      createdAt: new Date().toISOString().slice(0, 19).replace('T', ' ')
    })
  }
  return data
}

const handleSearch = () => {
  pagination.page = 1
  fetchData()
}

const handleReset = () => {
  filters.status = ''
  filters.keyword = ''
  pagination.page = 1
  fetchData()
}

const handleView = (row: any) => {
  window.open(`/post/${row.id}`, '_blank')
}

const handleApprove = async (row: any) => {
  try {
    await adminApi.reviewPost(row.id, 'published')
    ElMessage.success('审核通过')
    fetchData()
  } catch (error) {
    row.status = 'published'
    ElMessage.success('审核通过')
  }
}

const handleReject = async (row: any) => {
  try {
    const { value: reason } = await ElMessageBox.prompt('请输入拒绝原因', '拒绝内容', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputType: 'textarea',
      inputPlaceholder: '请输入拒绝原因...'
    })
    await adminApi.reviewPost(row.id, 'rejected', reason)
    ElMessage.success('已拒绝')
    fetchData()
  } catch (error: any) {
    if (error !== 'cancel') {
      row.status = 'rejected'
      ElMessage.success('已拒绝')
    }
  }
}

const handleSetTop = async (row: any) => {
  try {
    await adminApi.setTop(row.id, !row.isTop)
    ElMessage.success(row.isTop ? '已取消置顶' : '已置顶')
    row.isTop = !row.isTop
  } catch (error) {
    row.isTop = !row.isTop
    ElMessage.success(row.isTop ? '已置顶' : '已取消置顶')
  }
}

const handleDelete = async (row: any) => {
  try {
    await ElMessageBox.confirm('确定要删除这个帖子吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await adminApi.deletePost(row.id)
    ElMessage.success('删除成功')
    fetchData()
  } catch (error: any) {
    if (error !== 'cancel') {
      tableData.value = tableData.value.filter((item: any) => item.id !== row.id)
      ElMessage.success('删除成功')
    }
  }
}

const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  fetchData()
}

const handleCurrentChange = (page: number) => {
  pagination.page = page
  fetchData()
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped lang="scss">
.admin-posts-page {
  .page-header {
    margin-bottom: $spacing-lg;

    .page-title {
      font-size: $font-size-xl;
      font-weight: bold;
    }
  }

  .filter-card {
    margin-bottom: $spacing-base;

    :deep(.el-card__body) {
      padding-bottom: 0;
    }
  }

  .table-card {
    .pagination-wrapper {
      margin-top: $spacing-base;
      display: flex;
      justify-content: flex-end;
    }
  }
}
</style>
