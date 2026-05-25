import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from 'axios'
import { ElMessage } from 'element-plus'

const TOKEN_KEY = 'community_token'

const pendingRequests = new Map<string, AbortController>()

const getRequestKey = (config: AxiosRequestConfig): string => {
  return [
    config.method,
    config.url,
    JSON.stringify(config.data),
    JSON.stringify(config.params)
  ].join('&')
}

const addPendingRequest = (config: AxiosRequestConfig) => {
  const requestKey = getRequestKey(config)
  if (!pendingRequests.has(requestKey)) {
    const controller = new AbortController()
    config.signal = controller.signal
    pendingRequests.set(requestKey, controller)
  } else {
    const controller = pendingRequests.get(requestKey)
    if (controller) {
      controller.abort()
    }
    const newController = new AbortController()
    config.signal = newController.signal
    pendingRequests.set(requestKey, newController)
  }
}

const removePendingRequest = (config: AxiosRequestConfig) => {
  const requestKey = getRequestKey(config)
  pendingRequests.delete(requestKey)
}

const getBaseUrl = (): string => {
  return 'http://localhost:8080/api/v1'
}

class Request {
  private instance: AxiosInstance

  constructor() {
    this.instance = axios.create({
      baseURL: getBaseUrl(),
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    })

    this.instance.interceptors.request.use(
      (config) => {
        addPendingRequest(config)
        const token = typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => {
        return Promise.reject(error)
      }
    )

    this.instance.interceptors.response.use(
      (response: AxiosResponse) => {
        removePendingRequest(response.config)
        const { data } = response
        if (data.code === 200) {
          return data
        } else {
          ElMessage.error(data.message || '请求失败')
          return Promise.reject(new Error(data.message || '请求失败'))
        }
      },
      (error) => {
        if (error.config) {
          removePendingRequest(error.config)
        }
        if (axios.isCancel(error)) {
          return Promise.reject(error)
        }
        const status = error.response?.status
        let message = '网络错误'
        switch (status) {
          case 401:
            message = '登录已过期，请重新登录'
            if (typeof window !== 'undefined') {
              localStorage.removeItem(TOKEN_KEY)
              window.location.href = '/login'
            }
            break
          case 403:
            message = '没有权限访问'
            break
          case 404:
            message = '请求的资源不存在'
            break
          case 500:
            message = '服务器内部错误'
            break
          default:
            message = error.response?.data?.message || message
        }
        ElMessage.error(message)
        return Promise.reject(error)
      }
    )
  }

  get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.instance.get(url, config)
  }

  post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.instance.post(url, data, config)
  }

  put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.instance.put(url, data, config)
  }

  delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.instance.delete(url, config)
  }

  upload<T = any>(url: string, file: File, config?: AxiosRequestConfig): Promise<T> {
    const formData = new FormData()
    formData.append('file', file)
    return this.instance.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      ...config
    })
  }
}

const request = new Request()

export default request
