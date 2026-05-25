import axios from 'axios'
import {
  defineEventHandler,
  getRequestHeaders,
  readBody,
  readFormData,
  getQuery,
  sendStream
} from 'h3'

const config = useRuntimeConfig()

const BACKEND_API_URL = config.backendApiUrl || 'http://localhost:3001/api'

export default defineEventHandler(async (event) => {
  const method = event.method
  const url = event.node.req.url || ''
  const apiPath = url.replace(/^\/api/, '')

  const targetUrl = `${BACKEND_API_URL}${apiPath}`

  const headers = getRequestHeaders(event)

  const excludedHeaders = ['host', 'connection', 'content-length']
  const filteredHeaders: Record<string, string> = {}
  for (const [key, value] of Object.entries(headers)) {
    if (!excludedHeaders.includes(key) && value) {
      filteredHeaders[key] = value
    }
  }

  try {
    let body: any
    if (method !== 'GET' && method !== 'HEAD') {
      const contentType = headers['content-type'] || ''
      if (contentType.includes('multipart/form-data')) {
        const formData = await readFormData(event)
        body = formData
      } else {
        body = await readBody(event)
      }
    }

    const response = await axios({
      method,
      url: targetUrl,
      headers: filteredHeaders,
      params: method === 'GET' ? getQuery(event) : undefined,
      data: body,
      timeout: 30000,
      responseType: 'stream',
      maxRedirects: 0,
      validateStatus: () => true
    })

    event.node.res.statusCode = response.status

    for (const [key, value] of Object.entries(response.headers)) {
      if (key.toLowerCase() !== 'transfer-encoding' && value) {
        event.node.res.setHeader(key, value)
      }
    }

    return sendStream(event, response.data)
  } catch (error: any) {
    if (error.response) {
      event.node.res.statusCode = error.response.status
      for (const [key, value] of Object.entries(error.response.headers)) {
        if (key.toLowerCase() !== 'transfer-encoding' && value) {
          event.node.res.setHeader(key, value)
        }
      }
      return error.response.data
    }

    event.node.res.statusCode = 503
    return {
      code: 503,
      message: '后端服务不可用，请稍后重试'
    }
  }
})
