import request from '~/utils/request'

export interface AdminUser {
  id: string
  username: string
  nickname: string
  avatar: string
  role: 'super_admin' | 'admin'
  createdAt: string
}

export interface AdminPost extends Post {
  author: {
    id: string
    username: string
    nickname: string
  }
}

export interface OperationLog {
  id: string
  adminId: string
  adminName: string
  action: string
  target: string
  targetId: string
  ip: string
  createdAt: string
}

export const adminApi = {
  login: (username: string, password: string) =>
    request.post('/admin/auth/login', { username, password }),

  logout: () => request.post('/admin/auth/logout'),

  getUsers: (params: {
    page?: number
    pageSize?: number
    keyword?: string
    isBanned?: boolean
  }) => request.get('/admin/users', { params }),

  banUser: (userId: string, reason: string) =>
    request.post(`/admin/users/${userId}/ban`, { reason }),

  unbanUser: (userId: string) => request.post(`/admin/users/${userId}/unban`),

  getPosts: (params: {
    page?: number
    pageSize?: number
    status?: string
    keyword?: string
  }) => request.get('/admin/posts', { params }),

  reviewPost: (postId: string, status: 'published' | 'rejected', reason?: string) =>
    request.post(`/admin/posts/${postId}/review`, { status, reason }),

  deletePost: (postId: string) => request.delete(`/admin/posts/${postId}`),

  setTop: (postId: string, isTop: boolean) =>
    request.post(`/admin/posts/${postId}/top`, { isTop }),

  setHot: (postId: string, isHot: boolean) =>
    request.post(`/admin/posts/${postId}/hot`, { isHot }),

  getCategories: () => request.get('/admin/categories'),

  createCategory: (name: string, description?: string) =>
    request.post('/admin/categories', { name, description }),

  updateCategory: (id: string, name: string, description?: string) =>
    request.put(`/admin/categories/${id}`, { name, description }),

  deleteCategory: (id: string) => request.delete(`/admin/categories/${id}`),

  getReports: (params: {
    page?: number
    pageSize?: number
    status?: string
  }) => request.get('/admin/reports', { params }),

  handleReport: (reportId: string, action: string, remark?: string) =>
    request.post(`/admin/reports/${reportId}/handle`, { action, remark }),

  getOperationLogs: (params: {
    page?: number
    pageSize?: number
    adminId?: string
    startDate?: string
    endDate?: string
  }) => request.get('/admin/logs', { params }),

  getStatistics: () => request.get('/admin/statistics'),

  getTrendData: (days: number = 7) =>
    request.get('/admin/statistics/trend', { params: { days } })
}

export default adminApi
