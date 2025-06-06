export interface BoxState {
  id: string
  position: [number, number, number]
  velocity: [number, number, number]
}

export interface WebSocketMessage {
  type: 'host' | 'join' | 'state' | 'leave'
  id: string
  gameCode: string
  position?: [number, number, number]
}

export interface GameConfig {
  container: HTMLElement
  gameCode: string
  isHost: boolean
  logFn?: (msg: string) => void
} 