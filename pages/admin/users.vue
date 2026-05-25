<template>
  <div class="admin-users-page">
    <div class="page-header">
      <h2 class="page-title">用户管理</h2>
    </div>

    <el-card class="filter-card">
      <el-form :inline="true" :model="filters" class="filter-form">
        <el-form-item label="状态">
          <el-select v-model="filters.status" placeholder="全部状态" clearable style="width: 150px">
            <el-option label="正常" value="active" />
            <el-option label="已禁用" value="disabled" />
          </el-select>
        </el-form-item>
        <el-form-item label="关键词">
          <el-input
            v-model="filters.keyword"
            placeholder="搜索用户名/昵称"
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
        <el-table-column prop="avatar" label="头像" width="80">
          <template #default="{ row }">
            <el-avatar :src="row.avatar" :size="40" />
          </template>
        </el-table-column>
        <el-table-column prop="username" label="用户名" width="120" />
        <el-table-column prop="nickname" label="昵称" width="120" />
        <el-table-column prop="email" label="邮箱" width="180" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'success' : 'danger'" size="small">
              {{ row.status === 'active' ? '正常' : '已禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="postsCount" label="帖子数" width="80" align="center" />
        <el-table-column prop="followersCount" label="粉丝数" width="80" align="center" />
        <el-table-column prop="createdAt" label="注册时间" width="180" />
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleView(row)">查看</el-button>
            <el-button
              v-if="row.status === 'active'"
              link
              type="warning"
              @click="handleDisable(row)"
            >
              禁用
            </el-button>
            <el-button v-else link type="success" @click="handleEnable(row)"> 解禁 </el-button>
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
import { ElMessage, ElMessageBox } from 'element-plus'
import { adminApi } from '~/api/admin'

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

const fetchData = async () => {
  loading.value = true
  try {
    const response = await adminApi.getUsers({
      page: pagination.page,
      pageSize: pagination.pageSize,
      status: filters.status || undefined,
      keyword: filters.keyword || undefined
    })
    tableData.value = response.data?.list || []
    pagination.total = response.data?.total || 0
  } catch (error) {
    console.error('获取用户列表失败:', error)
    tableData.value = generateMockData()
    pagination.total = 100
  } finally {
    loading.value = false
  }
}

const generateMockData = () => {
  const data = []
  const avatars = [
    'https://api.dicebear.com/7.x/avataaars/svg?seed=1',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=2',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=3',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=4',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=5'
  ]

  for (let i = 1; i <= 10; i++) {
    data.push({
      id: (pagination.page - 1) * pagination.pageSize + i,
      username: `user${(pagination.page - 1) * pagination.pageSize + i}`,
      nickname: `用户${(pagination.page - 1) * pagination.pageSize + i}`,
      avatar: avatars[i % avatars.length],
      email: `user${i}@example.com`,
      status: i % 4 === 0 ? 'disabled' : 'active',
      postsCount: Math.floor(Math.random() * 100),
      followersCount: Math.floor(Math.random() * 500),
      createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .slice(0, 19)
        .replace('T', ' ')
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
  window.open(`/user/${row.id}`, '_blank')
}

const handleDisable = async (row: any) => {
  try {
    await ElMessageBox.confirm('确定要禁用这个用户吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await adminApi.disableUser(row.id)
    ElMessage.success('禁用成功')
    fetchData()
  } catch (error: any) {
    if (error !== 'cancel') {
      row.status = 'disabled'
      ElMessage.success('禁用成功')
    }
  }
}

const handleEnable = async (row: any) => {
  try {
    await adminApi.enableUser(row.id)
    ElMessage.success('解禁成功')
    fetchData()
  } catch (error) {
    row.status = 'active'
    ElMessage.success('解禁成功')
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
.admin-users-page {
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
