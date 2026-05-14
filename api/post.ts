import request from '~/utils/request'

export interface Post {
  id: string
  title: string
  content: string
  images: string[]
  categoryId: string
  categoryName: string
  topics: string[]
  author: {
    id: string
    nickname: string
    avatar: string
  }
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
  updatedAt: string
}

export interface CreatePostParams {
  title: string
  content: string
  images: string[]
  categoryId: string
  topics: string[]
}

export interface Comment {
  id: string
  content: string
  user: {
    id: string
    nickname: string
    avatar: string
  }
  postId: string
  parentId: string | null
  replyTo?: {
    id: string
    nickname: string
  }
  likesCount: number
  replies: Comment[]
  isLiked: boolean
  createdAt: string
}

export const postApi = {
  getList: (params: {
    page?: number
    pageSize?: number
    categoryId?: string
    keyword?: string
    sort?: 'latest' | 'hot' | 'recommend'
  }) => request.get('/posts', { params }),

  getById: (id: string) => request.get<Post>(`/posts/${id}`),

  create: (params: CreatePostParams) => request.post('/posts', params),

  update: (id: string, params: Partial<CreatePostParams>) => request.put(`/posts/${id}`, params),

  delete: (id: string) => request.delete(`/posts/${id}`),

  like: (id: string) => request.post(`/posts/${id}/like`),

  unlike: (id: string) => request.delete(`/posts/${id}/like`),

  collect: (id: string) => request.post(`/posts/${id}/collect`),

  uncollect: (id: string) => request.delete(`/posts/${id}/collect`),

  report: (id: string, reason: string) => request.post(`/posts/${id}/report`, { reason }),

  getComments: (postId: string, page: number = 1, pageSize: number = 20) =>
    request.get(`/posts/${postId}/comments`, { params: { page, pageSize } }),

  createComment: (postId: string, content: string, parentId?: string, replyToId?: string) =>
    request.post(`/posts/${postId}/comments`, { content, parentId, replyToId }),

  deleteComment: (commentId: string) => request.delete(`/comments/${commentId}`),

  likeComment: (commentId: string) => request.post(`/comments/${commentId}/like`),

  unlikeComment: (commentId: string) => request.delete(`/comments/${commentId}/like`),

  getCategories: () => request.get('/categories'),

  getTopics: () => request.get('/topics'),

  getHotList: () => request.get('/posts/hot'),

  getTopList: () => request.get('/posts/top')
}

export default postApi
