import request from '~/utils/request'
import type {
  User,
  Post,
  Category,
  Report,
  OperationLog,
  Statistics,
  TrendData,
  PageResult,
  AdminRole,
  ApiResponse
} from '~/types'

export interface AdminUser {
  id: number
  username: string
  nickname: string
  avatar: string
  role: AdminRole
  createdAt: string
}

export interface AdminLoginData {
  token: string
  admin: AdminUser
}

export const adminApi = {
  login: (username: string, password: string) =>
    request.post<ApiResponse<AdminLoginData>>('/admin/auth/login', { username, password }),

  getUsers: (params: { page?: number; pageSize?: number; keyword?: string; isBanned?: boolean }) =>
    request.get<ApiResponse<PageResult<User>>>('/admin/users', { params }),

  banUser: (userId: number, reason: string) =>
    request.post<ApiResponse<void>>(`/admin/users/${userId}/ban`, { reason }),

  unbanUser: (userId: number) => request.post<ApiResponse<void>>(`/admin/users/${userId}/unban`),

  getPosts: (params: { page?: number; pageSize?: number; status?: string; keyword?: string }) =>
    request.get<ApiResponse<PageResult<Post>>>('/admin/posts', { params }),

  reviewPost: (postId: number, status: 'published' | 'rejected', reason?: string) =>
    request.post<ApiResponse<void>>(`/admin/posts/${postId}/review`, { status, reason }),

  deletePost: (postId: number) => request.delete<ApiResponse<void>>(`/admin/posts/${postId}`),

  setTop: (postId: number, isTop: boolean) =>
    request.post<ApiResponse<void>>(`/admin/posts/${postId}/top`, { isTop }),

  setHot: (postId: number, isHot: boolean) =>
    request.post<ApiResponse<void>>(`/admin/posts/${postId}/hot`, { isHot }),

  getCategories: () => request.get<ApiResponse<Category[]>>('/admin/categories'),

  createCategory: (name: string, description?: string, sortOrder?: number) =>
    request.post<ApiResponse<Category>>('/admin/categories', { name, description, sortOrder }),

  updateCategory: (id: number, name: string, description?: string, sortOrder?: number) =>
    request.put<ApiResponse<Category>>(`/admin/categories/${id}`, { name, description, sortOrder }),

  deleteCategory: (id: number) => request.delete<ApiResponse<void>>(`/admin/categories/${id}`),

  getReports: (params: { page?: number; pageSize?: number; status?: string }) =>
    request.get<ApiResponse<PageResult<Report>>>('/admin/reports', { params }),

  handleReport: (reportId: number, action: 'handled' | 'ignored', remark?: string) =>
    request.post<ApiResponse<void>>(`/admin/reports/${reportId}/handle`, { action, remark }),

  getOperationLogs: (params: {
    page?: number
    pageSize?: number
    adminId?: number
    startDate?: string
    endDate?: string
  }) => request.get<ApiResponse<PageResult<OperationLog>>>('/admin/logs', { params }),

  getStatistics: () => request.get<ApiResponse<Statistics>>('/admin/statistics'),

  getTrendData: (days: number = 7) =>
    request.get<ApiResponse<TrendData>>('/admin/statistics/trend', { params: { days } })
}

export default adminApi
