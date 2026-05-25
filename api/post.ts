import request from '~/utils/request'
import type { Post, Comment, Category, Topic, PageResult, ApiResponse } from '~/types'

export interface CreatePostParams {
  title: string
  content: string
  images?: string[]
  categoryId?: number
  topicIds?: number[]
}

export interface UpdatePostParams {
  title?: string
  content?: string
  images?: string[]
  categoryId?: number
  topicIds?: number[]
}

export const postApi = {
  getList: (params: {
    page?: number
    pageSize?: number
    categoryId?: number
    keyword?: string
    sort?: 'latest' | 'hot' | 'recommend'
  }) => request.get<ApiResponse<PageResult<Post>>>('/posts', { params }),

  getHotList: () => request.get<ApiResponse<Post[]>>('/posts/hot'),

  getTopList: () => request.get<ApiResponse<Post[]>>('/posts/top'),

  getById: (id: number) => request.get<ApiResponse<Post>>(`/posts/${id}`),

  create: (params: CreatePostParams) => request.post<ApiResponse<Post>>('/posts', params),

  update: (id: number, params: UpdatePostParams) => request.put<ApiResponse<Post>>(`/posts/${id}`, params),

  delete: (id: number) => request.delete<ApiResponse<void>>(`/posts/${id}`),

  like: (id: number) => request.post<ApiResponse<void>>(`/posts/${id}/like`),

  unlike: (id: number) => request.delete<ApiResponse<void>>(`/posts/${id}/like`),

  collect: (id: number) => request.post<ApiResponse<void>>(`/posts/${id}/collect`),

  uncollect: (id: number) => request.delete<ApiResponse<void>>(`/posts/${id}/collect`),

  report: (id: number, reason: string) => request.post<ApiResponse<void>>(`/posts/${id}/report`, { reason }),

  getComments: (postId: number, page: number = 1, pageSize: number = 20) =>
    request.get<ApiResponse<PageResult<Comment>>>(`/posts/${postId}/comments`, { params: { page, pageSize } }),

  createComment: (postId: number, content: string, parentId?: number, replyToId?: number) =>
    request.post<ApiResponse<Comment>>(`/posts/${postId}/comments`, { content, parentId, replyToId }),

  deleteComment: (commentId: number) => request.delete<ApiResponse<void>>(`/comments/${commentId}`),

  likeComment: (commentId: number) => request.post<ApiResponse<void>>(`/comments/${commentId}/like`),

  unlikeComment: (commentId: number) => request.delete<ApiResponse<void>>(`/comments/${commentId}/like`),

  getCategories: () => request.get<ApiResponse<Category[]>>('/categories'),

  getTopics: () => request.get<ApiResponse<Topic[]>>('/topics'),

  getHotTopics: () => request.get<ApiResponse<Topic[]>>('/topics/hot'),

  uploadImage: (file: File) => request.upload<ApiResponse<{ url: string }>>('/upload/image', file)
}

export default postApi
