import request from '~/utils/request'
import type { User } from '~/stores/user'

export interface LoginParams {
  username: string
  password: string
}

export interface RegisterParams {
  username: string
  email: string
  password: string
  confirmPassword: string
  captcha: string
}

export interface UpdateProfileParams {
  nickname?: string
  bio?: string
  gender?: 'male' | 'female' | 'unknown'
  birthday?: string
  location?: string
}

export const userApi = {
  login: (params: LoginParams) => request.post('/auth/login', params),
  register: (params: RegisterParams) => request.post('/auth/register', params),
  getCaptcha: () => request.get('/auth/captcha'),
  getUserInfo: () => request.get<User>('/user/info'),
  updateUserInfo: (params: UpdateProfileParams) => request.put('/user/info', params),
  uploadAvatar: (file: File) => request.upload('/user/avatar', file),
  getUserById: (id: string) => request.get<User>(`/user/${id}`),
  followUser: (id: string) => request.post(`/user/follow/${id}`),
  unfollowUser: (id: string) => request.delete(`/user/follow/${id}`),
  getFollowers: (id: string, page: number = 1, pageSize: number = 20) =>
    request.get(`/user/${id}/followers`, { params: { page, pageSize } }),
  getFollowing: (id: string, page: number = 1, pageSize: number = 20) =>
    request.get(`/user/${id}/following`, { params: { page, pageSize } }),
  getMyPosts: (page: number = 1, pageSize: number = 20) =>
    request.get('/user/posts', { params: { page, pageSize } }),
  getMyCollections: (page: number = 1, pageSize: number = 20) =>
    request.get('/user/collections', { params: { page, pageSize } })
}

export default userApi
