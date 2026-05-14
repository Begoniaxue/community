type WebSocketMessageHandler = (data: any) => void

interface WebSocketOptions {
  url: string
  onMessage?: WebSocketMessageHandler
  onOpen?: () => void
  onClose?: () => void
  onError?: (error: Event) => void
  heartbeatInterval?: number
  reconnectInterval?: number
  maxReconnectAttempts?: number
}

class WebSocketClient {
  private ws: WebSocket | null = null
  private url: string
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null
  private reconnectAttempts = 0
  private isManualClose = false
  private messageHandlers: Map<string, WebSocketMessageHandler[]> = new Map()

  private heartbeatInterval: number
  private reconnectInterval: number
  private maxReconnectAttempts: number

  private onOpenCallback?: () => void
  private onCloseCallback?: () => void
  private onErrorCallback?: (error: Event) => void

  constructor(options: WebSocketOptions) {
    this.url = options.url
    this.heartbeatInterval = options.heartbeatInterval || 30000
    this.reconnectInterval = options.reconnectInterval || 5000
    this.maxReconnectAttempts = options.maxReconnectAttempts || 10
    this.onOpenCallback = options.onOpen
    this.onCloseCallback = options.onClose
    this.onErrorCallback = options.onError

    if (options.onMessage) {
      this.addMessageHandler('default', options.onMessage)
    }
  }

  connect(): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      return
    }

    try {
      this.ws = new WebSocket(this.url)
      this.initEventListeners()
    } catch (error) {
      console.error('WebSocket连接失败:', error)
      this.handleReconnect()
    }
  }

  private initEventListeners(): void {
    if (!this.ws) return

    this.ws.onopen = () => {
      console.log('WebSocket连接成功')
      this.reconnectAttempts = 0
      this.isManualClose = false
      this.startHeartbeat()
      this.onOpenCallback?.()
    }

    this.ws.onmessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data)
        this.handleMessage(data)
      } catch (error) {
        console.error('WebSocket消息解析失败:', error)
      }
    }

    this.ws.onclose = (event: CloseEvent) => {
      console.log('WebSocket连接关闭:', event.code, event.reason)
      this.stopHeartbeat()
      this.onCloseCallback?.()
      if (!this.isManualClose) {
        this.handleReconnect()
      }
    }

    this.ws.onerror = (error: Event) => {
      console.error('WebSocket错误:', error)
      this.onErrorCallback?.(error)
    }
  }

  private handleMessage(data: any): void {
    const type = data.type || 'default'
    const handlers = this.messageHandlers.get(type)
    if (handlers) {
      handlers.forEach((handler) => handler(data))
    }
  }

  private startHeartbeat(): void {
    this.stopHeartbeat()
    this.heartbeatTimer = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.send({ type: 'heartbeat' })
      }
    }, this.heartbeatInterval)
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer)
      this.heartbeatTimer = null
    }
  }

  private handleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('WebSocket重连次数已达上限，停止重连')
      return
    }

    this.reconnectAttempts++
    console.log(`WebSocket第${this.reconnectAttempts}次重连中...`)

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
    }

    this.reconnectTimer = setTimeout(() => {
      this.connect()
    }, this.reconnectInterval)
  }

  send(data: any): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data))
    } else {
      console.warn('WebSocket未连接，消息发送失败')
    }
  }

  addMessageHandler(type: string, handler: WebSocketMessageHandler): void {
    if (!this.messageHandlers.has(type)) {
      this.messageHandlers.set(type, [])
    }
    this.messageHandlers.get(type)!.push(handler)
  }

  removeMessageHandler(type: string, handler: WebSocketMessageHandler): void {
    const handlers = this.messageHandlers.get(type)
    if (handlers) {
      const index = handlers.indexOf(handler)
      if (index > -1) {
        handlers.splice(index, 1)
      }
    }
  }

  close(): void {
    this.isManualClose = true
    this.stopHeartbeat()
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
    this.ws?.close()
    this.ws = null
  }

  get readyState(): number {
    return this.ws?.readyState ?? WebSocket.CLOSED
  }
}

let globalWebSocket: WebSocketClient | null = null

export const createWebSocket = (options: WebSocketOptions): WebSocketClient => {
  if (globalWebSocket) {
    globalWebSocket.close()
  }
  globalWebSocket = new WebSocketClient(options)
  return globalWebSocket
}

export const getWebSocket = (): WebSocketClient | null => {
  return globalWebSocket
}

export default WebSocketClient
