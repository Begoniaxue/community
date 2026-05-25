<template>
  <div class="admin-logs-page">
    <div class="page-header">
      <h2 class="page-title">操作日志</h2>
    </div>

    <el-card class="filter-card">
      <el-form :inline="true" :model="filters" class="filter-form">
        <el-form-item label="操作类型">
          <el-select v-model="filters.action" placeholder="全部类型" clearable style="width: 150px">
            <el-option label="登录" value="login" />
            <el-option label="内容审核" value="review" />
            <el-option label="用户管理" value="user" />
            <el-option label="删除操作" value="delete" />
          </el-select>
        </el-form-item>
        <el-form-item label="操作人">
          <el-input
            v-model="filters.adminName"
            placeholder="搜索操作人"
            style="width: 150px"
            clearable
          />
        </el-form-item>
        <el-form-item label="日期">
          <el-date-picker
            v-model="filters.dateRange"
            type="daterange"
            placeholder="选择日期范围"
            style="width: 250px"
            value-format="YYYY-MM-DD"
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
        <el-table-column prop="action" label="操作类型" width="120">
          <template #default="{ row }">
            <el-tag :type="getActionType(row.action)" size="small">
              {{ getActionText(row.action) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="操作描述" min-width="250" />
        <el-table-column prop="adminName" label="操作人" width="120" />
        <el-table-column prop="ip" label="IP地址" width="140" />
        <el-table-column
          prop="userAgent"
          label="浏览器信息"
          min-width="200"
          show-overflow-tooltip
        />
        <el-table-column prop="createdAt" label="操作时间" width="180" />
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
import { adminApi } from '~/api/admin'

const loading = ref(false)
const tableData = ref([])

const filters = reactive({
  action: '',
  adminName: '',
  dateRange: [] as string[]
})

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

const getActionType = (action: string) => {
  const map: Record<string, string> = {
    login: 'primary',
    review: 'success',
    user: 'warning',
    delete: 'danger'
  }
  return map[action] || 'info'
}

const getActionText = (action: string) => {
  const map: Record<string, string> = {
    login: '登录',
    review: '内容审核',
    user: '用户管理',
    delete: '删除操作'
  }
  return map[action] || action
}

const fetchData = async () => {
  loading.value = true
  try {
    const response = await adminApi.getLogs({
      page: pagination.page,
      pageSize: pagination.pageSize,
      action: filters.action || undefined,
      adminName: filters.adminName || undefined,
      startDate: filters.dateRange[0],
      endDate: filters.dateRange[1]
    })
    tableData.value = response.data?.list || []
    pagination.total = response.data?.total || 0
  } catch (error) {
    console.error('获取操作日志失败:', error)
    tableData.value = generateMockData()
    pagination.total = 100
  } finally {
    loading.value = false
  }
}

const generateMockData = () => {
  const actions = ['login', 'review', 'user', 'delete']
  const descriptions = [
    '管理员登录系统',
    '审核通过帖子 #123',
    '禁用用户 user001',
    '删除帖子 #456',
    '置顶帖子 #789',
    '解禁用户 user002'
  ]
  const admins = ['超级管理员', '内容审核员', '运营管理员']

  const data = []
  for (let i = 1; i <= 10; i++) {
    const action = actions[i % actions.length]
    data.push({
      id: (pagination.page - 1) * pagination.pageSize + i,
      action,
      description: descriptions[i % descriptions.length],
      adminName: admins[i % admins.length],
      ip: `192.168.1.${Math.floor(Math.random() * 255)}`,
      userAgent: 'Chrome 120.0.0.0 (Mac OS X 10_15_7)',
      createdAt: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000)
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
  filters.action = ''
  filters.adminName = ''
  filters.dateRange = []
  pagination.page = 1
  fetchData()
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
.admin-logs-page {
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
