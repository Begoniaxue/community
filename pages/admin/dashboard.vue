<template>
  <div class="dashboard-page">
    <div class="stats-cards">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon" style="background: rgba(64, 158, 255, 0.1)">
                <el-icon :size="32" color="#409eff"><User /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ stats.totalUsers || 0 }}</div>
                <div class="stat-label">总用户数</div>
              </div>
            </div>
            <div class="stat-trend">
              <el-tag type="success" effect="light" size="small">
                +{{ stats.newUsersToday || 0 }} 今日新增
              </el-tag>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon" style="background: rgba(103, 194, 58, 0.1)">
                <el-icon :size="32" color="#67c23a"><Document /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ stats.totalPosts || 0 }}</div>
                <div class="stat-label">总帖子数</div>
              </div>
            </div>
            <div class="stat-trend">
              <el-tag type="success" effect="light" size="small">
                +{{ stats.newPostsToday || 0 }} 今日新增
              </el-tag>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon" style="background: rgba(230, 162, 60, 0.1)">
                <el-icon :size="32" color="#e6a23c"><ChatRound /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ stats.totalComments || 0 }}</div>
                <div class="stat-label">总评论数</div>
              </div>
            </div>
            <div class="stat-trend">
              <el-tag type="success" effect="light" size="small">
                +{{ stats.newCommentsToday || 0 }} 今日新增
              </el-tag>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon" style="background: rgba(245, 108, 108, 0.1)">
                <el-icon :size="32" color="#f56c6c"><UserFilled /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ stats.onlineUsers || 0 }}</div>
                <div class="stat-label">在线用户</div>
              </div>
            </div>
            <div class="stat-trend">
              <el-tag type="info" effect="light" size="small">实时在线</el-tag>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <div class="charts-section">
      <el-row :gutter="20">
        <el-col :span="16">
          <el-card class="chart-card">
            <template #header>
              <span class="card-title">用户增长趋势（近7天）</span>
            </template>
            <div ref="userTrendChartRef" class="chart-container"></div>
          </el-card>
        </el-col>
        <el-col :span="8">
          <el-card class="chart-card">
            <template #header>
              <span class="card-title">分类占比</span>
            </template>
            <div ref="categoryPieChartRef" class="chart-container"></div>
          </el-card>
        </el-col>
      </el-row>

      <el-row :gutter="20" style="margin-top: 20px">
        <el-col :span="12">
          <el-card class="chart-card">
            <template #header>
              <span class="card-title">内容发布量统计（近7天）</span>
            </template>
            <div ref="postTrendChartRef" class="chart-container"></div>
          </el-card>
        </el-col>
        <el-col :span="12">
          <el-card class="chart-card">
            <template #header>
              <span class="card-title">互动量统计（近7天）</span>
            </template>
            <div ref="interactionChartRef" class="chart-container"></div>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts'
import { User, Document, ChatRound, UserFilled } from '@element-plus/icons-vue'
import { adminApi } from '~/api/admin'

const userTrendChartRef = ref<HTMLElement>()
const categoryPieChartRef = ref<HTMLElement>()
const postTrendChartRef = ref<HTMLElement>()
const interactionChartRef = ref<HTMLElement>()

const stats = ref({
  totalUsers: 0,
  newUsersToday: 0,
  totalPosts: 0,
  newPostsToday: 0,
  totalComments: 0,
  newCommentsToday: 0,
  onlineUsers: 0
})

let userTrendChart: echarts.ECharts | null = null
let categoryPieChart: echarts.ECharts | null = null
let postTrendChart: echarts.ECharts | null = null
let interactionChart: echarts.ECharts | null = null

const generateMockData = () => {
  const days = []
  const dates = []
  for (let i = 6; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    days.push(date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' }))
    dates.push(date.toISOString().split('T')[0])
  }

  return {
    days,
    users: days.map(() => Math.floor(Math.random() * 100) + 20),
    posts: days.map(() => Math.floor(Math.random() * 50) + 10),
    comments: days.map(() => Math.floor(Math.random() * 200) + 50),
    likes: days.map(() => Math.floor(Math.random() * 500) + 100),
    shares: days.map(() => Math.floor(Math.random() * 50) + 10),
    categories: [
      { name: '技术', value: Math.floor(Math.random() * 100) + 100 },
      { name: '生活', value: Math.floor(Math.random() * 80) + 80 },
      { name: '娱乐', value: Math.floor(Math.random() * 60) + 60 },
      { name: '学习', value: Math.floor(Math.random() * 50) + 40 },
      { name: '其他', value: Math.floor(Math.random() * 30) + 20 }
    ]
  }
}

const fetchStats = async () => {
  try {
    const response = await adminApi.getStatistics()
    if (response.data) {
      stats.value = response.data
    }
  } catch (error) {
    console.error('获取统计数据失败:', error)
    stats.value = {
      totalUsers: 12580,
      newUsersToday: 128,
      totalPosts: 28956,
      newPostsToday: 89,
      totalComments: 156789,
      newCommentsToday: 456,
      onlineUsers: 234
    }
  }
}

const initCharts = () => {
  const mockData = generateMockData()

  if (userTrendChartRef.value) {
    userTrendChart = echarts.init(userTrendChartRef.value)
    userTrendChart.setOption({
      tooltip: {
        trigger: 'axis'
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: mockData.days
      },
      yAxis: {
        type: 'value'
      },
      series: [
        {
          name: '新增用户',
          type: 'line',
          smooth: true,
          data: mockData.users,
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(64, 158, 255, 0.3)' },
              { offset: 1, color: 'rgba(64, 158, 255, 0.05)' }
            ])
          },
          itemStyle: { color: '#409eff' }
        }
      ]
    })
  }

  if (categoryPieChartRef.value) {
    categoryPieChart = echarts.init(categoryPieChartRef.value)
    categoryPieChart.setOption({
      tooltip: {
        trigger: 'item'
      },
      legend: {
        orient: 'vertical',
        right: 10,
        top: 'center'
      },
      series: [
        {
          name: '分类占比',
          type: 'pie',
          radius: ['40%', '70%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 10,
            borderColor: '#fff',
            borderWidth: 2
          },
          label: {
            show: false,
            position: 'center'
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 14,
              fontWeight: 'bold'
            }
          },
          labelLine: {
            show: false
          },
          data: mockData.categories
        }
      ]
    })
  }

  if (postTrendChartRef.value) {
    postTrendChart = echarts.init(postTrendChartRef.value)
    postTrendChart.setOption({
      tooltip: {
        trigger: 'axis'
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: mockData.days
      },
      yAxis: {
        type: 'value'
      },
      series: [
        {
          name: '帖子发布量',
          type: 'bar',
          data: mockData.posts,
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#67c23a' },
              { offset: 1, color: '#85ce61' }
            ])
          },
          barWidth: '40%'
        }
      ]
    })
  }

  if (interactionChartRef.value) {
    interactionChart = echarts.init(interactionChartRef.value)
    interactionChart.setOption({
      tooltip: {
        trigger: 'axis'
      },
      legend: {
        data: ['评论', '点赞', '分享']
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: mockData.days
      },
      yAxis: {
        type: 'value'
      },
      series: [
        {
          name: '评论',
          type: 'bar',
          data: mockData.comments,
          itemStyle: { color: '#409eff' }
        },
        {
          name: '点赞',
          type: 'bar',
          data: mockData.likes,
          itemStyle: { color: '#e6a23c' }
        },
        {
          name: '分享',
          type: 'bar',
          data: mockData.shares,
          itemStyle: { color: '#67c23a' }
        }
      ]
    })
  }
}

const handleResize = () => {
  userTrendChart?.resize()
  categoryPieChart?.resize()
  postTrendChart?.resize()
  interactionChart?.resize()
}

onMounted(() => {
  fetchStats()
  initCharts()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  userTrendChart?.dispose()
  categoryPieChart?.dispose()
  postTrendChart?.dispose()
  interactionChart?.dispose()
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped lang="scss">
.dashboard-page {
  .stats-cards {
    margin-bottom: $spacing-lg;

    :deep(.el-card__body) {
      padding: $spacing-lg;
    }
  }

  .stat-card {
    .stat-content {
      display: flex;
      align-items: center;
      gap: $spacing-base;
      margin-bottom: $spacing-sm;
    }

    .stat-icon {
      width: 60px;
      height: 60px;
      border-radius: $border-radius-lg;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .stat-info {
      flex: 1;
    }

    .stat-value {
      font-size: 24px;
      font-weight: bold;
      color: $text-primary;
    }

    .stat-label {
      font-size: $font-size-sm;
      color: $text-secondary;
      margin-top: 4px;
    }

    .stat-trend {
      margin-top: $spacing-sm;
    }
  }

  .chart-card {
    :deep(.el-card__header) {
      padding: $spacing-base $spacing-lg;
      border-bottom: 1px solid $border-light;
    }

    .card-title {
      font-weight: bold;
      color: $text-primary;
    }
  }

  .chart-container {
    height: 300px;
  }
}
</style>
