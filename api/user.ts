import request from '~/utils/request'
import type { User, CaptchaData, LoginData, PageResult, Post, ApiResponse } from '~/types'

export interface LoginParams {
  username: string
  password: string
}

export interface RegisterParams {
  username: string
  phone: string
  email?: string
  password: string
  confirmPassword: string
  captcha: string
  captchaKey: string
}

export interface UpdateProfileParams {
  nickname?: string
  bio?: string
  gender?: 0 | 1 | 2
  birthday?: string
  location?: string
}

export const userApi = {
  getCaptcha: () => request.get<ApiResponse<CaptchaData>>('/auth/captcha'),

  login: (params: LoginParams) => request.post<ApiResponse<LoginData>>('/auth/login', params),

  register: (params: RegisterParams) => request.post<ApiResponse<void>>('/auth/register', params),

  getUserInfo: () => request.get<ApiResponse<User>>('/user/info'),

  updateUserInfo: (params: UpdateProfileParams) => request.put<ApiResponse<User>>('/user/info', params),

  uploadAvatar: (file: File) => request.upload<ApiResponse<{ avatar: string }>>('/user/avatar', file),

  getUserById: (id: number) => request.get<ApiResponse<User>>(`/user/${id}`),

  followUser: (id: number) => request.post<ApiResponse<void>>(`/user/follow/${id}`),

  unfollowUser: (id: number) => request.delete<ApiResponse<void>>(`/user/follow/${id}`),

  getFollowers: (id: number, page: number = 1, pageSize: number = 20) =>
    request.get<ApiResponse<PageResult<User>>>(`/user/${id}/followers`, { params: { page, pageSize } }),

  getFollowing: (id: number, page: number = 1, pageSize: number = 20) =>
    request.get<ApiResponse<PageResult<User>>>(`/user/${id}/following`, { params: { page, pageSize } }),

  getMyPosts: (page: number = 1, pageSize: number = 20) =>
    request.get<ApiResponse<PageResult<Post>>>('/user/posts', { params: { page, pageSize } }),

  getMyCollections: (page: number = 1, pageSize: number = 20) =>
    request.get<ApiResponse<PageResult<Post>>>('/user/collections', { params: { page, pageSize } })
}

export default userApi
