import type { WebSocketMessage, HostMessage, JoinMessage } from '../types'

export class WebSocketManager {
  private ws: WebSocket
  private messageHandlers: ((msg: WebSocketMessage) => void)[] = []
  private isConnected = false
  private pendingMessages: WebSocketMessage[] = []

  constructor(
    private url: string = 'localhost',
    private port: number = 3300,
    private logFn?: (msg: string) => void
  ) {
    const wsUrl = `ws://${url}:${port}`
    this.ws = new WebSocket(wsUrl)
    this.setupWebSocket()
  }

  private setupWebSocket() {
    this.ws.onopen = () => {
      this.logFn?.('[ws] open')
      this.isConnected = true
      this.pendingMessages.forEach(msg => this.send(msg))
      this.pendingMessages = []
    }

    this.ws.onerror = (e) => {
      this.logFn?.('[ws] error: ' + (e instanceof Event ? 'Event' : JSON.stringify(e)))
    }

    this.ws.onclose = () => {
      this.logFn?.('[ws] close')
      this.isConnected = false
    }

    this.ws.onmessage = (event) => {
      this.logFn?.('[ws] recv: ' + event.data)
      const msg = JSON.parse(event.data) as WebSocketMessage
      console.log('onMessage', msg)
      this.messageHandlers.forEach(handler => handler(msg))
    }
  }

  public connect(gameCode: string, localId: string, isHost: boolean) {
    const message: HostMessage | JoinMessage = {
      type: isHost ? 'host' : 'join',
      id: localId,
      gameCode
    }
    this.send(message)
  }

  public send(message: WebSocketMessage) {
    if (this.isConnected) {
      this.ws.send(JSON.stringify(message))
      this.logFn?.('[ws] send: ' + JSON.stringify(message))
    } else {
      this.pendingMessages.push(message)
    }
  }

  public onMessage(handler: (msg: WebSocketMessage) => void) {
    this.messageHandlers.push(handler)
    return () => this.removeMessageHandler(handler)
  }

  public removeMessageHandler(handler: (msg: WebSocketMessage) => void) {
    const index = this.messageHandlers.indexOf(handler)
    if (index !== -1) {
      this.messageHandlers.splice(index, 1)
    }
  }

  public close() {
    this.ws.close()
  }
} 