export interface BoxState {
  id: string
  position: [number, number, number]
  velocity: [number, number, number]
}

export interface Player {
  id: string
  position?: [number, number, number]
}

export interface WebSocketMessage {
  type: 'host' | 'join' | 'state' | 'leave' | 'instrument_note' | 'player_info'
  id: string
  gameCode: string
  position?: [number, number, number]
  instrumentId?: string
  noteId?: number
  players?: Player[]
}
export interface HostMessage extends WebSocketMessage {
  type: 'host'
}

export interface JoinMessage extends WebSocketMessage {
  type: 'join'
}

export interface GameConfig {
  container: HTMLElement
  gameCode: string
  isHost: boolean
  logFn?: (msg: string) => void
} 