import type { WebSocketMessage } from '../types'

export class WebSocketManager {
  private ws: WebSocket
  private messageHandlers: ((msg: WebSocketMessage) => void)[] = []

  constructor(
    private url: string = '0.0.0.0',
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
    }

    this.ws.onerror = (e) => {
      this.logFn?.('[ws] error: ' + (e instanceof Event ? 'Event' : JSON.stringify(e)))
    }

    this.ws.onclose = () => {
      this.logFn?.('[ws] close')
    }

    this.ws.onmessage = (event) => {
      this.logFn?.('[ws] recv: ' + event.data)
      const msg = JSON.parse(event.data) as WebSocketMessage
      this.messageHandlers.forEach(handler => handler(msg))
    }
  }

  public connect(gameCode: string, localId: string, isHost: boolean) {
    const joinMsg: WebSocketMessage = {
      type: isHost ? 'host' : 'join',
      gameCode,
      id: localId,
    }
    this.send(joinMsg)
  }

  public send(message: WebSocketMessage) {
    if (this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message))
      this.logFn?.('[ws] send: ' + JSON.stringify(message))
    }
  }

  public onMessage(handler: (msg: WebSocketMessage) => void) {
    this.messageHandlers.push(handler)
  }

  public close() {
    this.ws.close()
  }
} 