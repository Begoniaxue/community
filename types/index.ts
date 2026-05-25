export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
  timestamp: number
}

export interface PageResult<T> {
  records: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface CaptchaData {
  key: string
  image: string
}

export interface User {
  id: number
  username: string
  nickname: string
  avatar: string
  phone: string
  email?: string
  gender: 0 | 1 | 2
  birthday?: string
  location?: string
  bio?: string
  followersCount: number
  followingCount: number
  postsCount: number
  isAdmin: boolean
  isBanned: boolean
  createdAt: string
}

export interface LoginData {
  token: string
  user: User
}

export interface Category {
  id: number
  name: string
  description: string
  sortOrder: number
}

export interface Topic {
  id: number
  name: string
  description: string
  coverImage?: string
  postsCount: number
  isHot: boolean
}

export interface Post {
  id: number
  title: string
  content: string
  images: string[]
  categoryId: number
  categoryName: string
  topics: string[]
  author: User
  isTop: boolean
  isHot: boolean
  viewsCount: number
  likesCount: number
  commentsCount: number
  collectionsCount: number
  isLiked: boolean
  isCollected: boolean
  status: 'draft' | 'published' | 'reviewing' | 'rejected'
  createdAt: string
}

export interface Comment {
  id: number
  content: string
  user: User
  postId: number
  parentId?: number
  replyTo?: User
  likesCount: number
  replies: Comment[]
  isLiked: boolean
  createdAt: string
}

export interface Report {
  id: number
  postId: number
  postTitle: string
  userId: number
  userName: string
  reason: string
  status: 'pending' | 'handled' | 'ignored'
  createdAt: string
  handledAt?: string
  handledBy?: string
  remark?: string
}

export interface OperationLog {
  id: number
  adminId: number
  adminName: string
  action: string
  target: string
  targetId: string
  ip: string
  createdAt: string
}

export interface Statistics {
  totalUsers: number
  totalPosts: number
  totalComments: number
  todayUsers: number
  todayPosts: number
  todayComments: number
  pendingReports: number
  pendingPosts: number
}

export interface TrendData {
  dates: string[]
  userCounts: number[]
  postCounts: number[]
  commentCounts: number[]
}

export type Gender = 0 | 1 | 2

export type PostStatus = 'draft' | 'published' | 'reviewing' | 'rejected'

export type ReportStatus = 'pending' | 'handled' | 'ignored'

export type AdminRole = 'super_admin' | 'admin'
