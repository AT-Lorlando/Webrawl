import { WebSocketServer, WebSocket } from 'ws'

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

// Map gameCode -> Map of client sockets to Player
const games: Map<string, Map<WebSocket, Player>> = new Map()
const host = "0.0.0.0"
const port = 3300
const wss = new WebSocketServer({ host, port })

wss.on('connection', (ws: WebSocket) => {
    let joinedGame: string | null = null
    let clientId: string | null = null

    ws.on('message', (data: Buffer) => {
        try {
            const msg = JSON.parse(data.toString()) as WebSocketMessage
            if ((msg.type === 'host' || msg.type === 'join') && msg.gameCode && msg.id) {
                const gameCode = msg.gameCode
                joinedGame = gameCode
                clientId = msg.id
                console.log(`Setting joinedGame to ${gameCode} and clientId to ${msg.id}`)
                if (!games.has(gameCode)) {
                    games.set(gameCode, new Map())
                    console.log(`[Room Created] gameCode: ${gameCode}`)
                }
                const room = games.get(gameCode)
                if (room && clientId) {
                    room.set(ws, { id: clientId })
                    console.log(`[Player ${msg.type === 'host' ? 'Host' : 'Join'}] id: ${clientId} joined gameCode: ${gameCode}`)
                    
                    // Send player_info to the new player with all existing players and their positions
                    const playerInfo: WebSocketMessage = {
                        type: 'player_info',
                        id: clientId,
                        gameCode: gameCode,
                        players: Array.from(room.entries())
                            .filter(([otherWs, _]) => otherWs !== ws)
                            .map(([_, playerData]) => ({
                                id: playerData.id,
                                position: playerData.position
                            }))
                    }
                    ws.send(JSON.stringify(playerInfo))
                    
                    // Notify others about the new player
                    for (const [otherWs, otherId] of room.entries()) {
                        if (otherWs !== ws && otherWs.readyState === WebSocket.OPEN) {
                            const joinMessage: WebSocketMessage = {
                                type: 'join',
                                id: clientId,
                                gameCode: gameCode
                            }
                            otherWs.send(JSON.stringify(joinMessage))
                            console.log(`Sent join message to ${otherId.id}`)
                        }
                    }
                }
            } else if (msg.type === 'state' && msg.gameCode && msg.id && msg.position && joinedGame && clientId) {
                const gameCode = msg.gameCode
                const room = games.get(gameCode)
                if (room) {
                    // Update the player's position in the room
                    const playerData = room.get(ws)
                    if (playerData) {
                        playerData.position = msg.position
                    }
                    
                    // Broadcast to other players
                    for (const [otherWs, otherId] of room.entries()) {
                        if (otherWs !== ws && otherWs.readyState === WebSocket.OPEN) {
                            const stateMessage: WebSocketMessage = {
                                type: 'state',
                                id: clientId,
                                gameCode: gameCode,
                                position: msg.position
                            }
                            otherWs.send(JSON.stringify(stateMessage))
                        }
                    }
                }
            } else if (msg.type === 'instrument_note' && msg.gameCode && msg.id && msg.instrumentId && msg.noteId !== undefined && joinedGame && clientId) {
                const gameCode = msg.gameCode
                const room = games.get(gameCode)
                console.log(`[Instrument Note] gameCode: ${gameCode} id: ${clientId} instrumentId: ${msg.instrumentId} noteId: ${msg.noteId}`)
                if (room) {
                    for (const [otherWs, otherId] of room.entries()) {
                        if (otherWs !== ws && otherWs.readyState === WebSocket.OPEN) {
                            const noteMessage: WebSocketMessage = {
                                type: 'instrument_note',
                                id: clientId,
                                gameCode: gameCode,
                                instrumentId: msg.instrumentId,
                                noteId: msg.noteId
                            }
                            otherWs.send(JSON.stringify(noteMessage))
                        }
                    }
                }
            } 
        } catch (e) {
            // Ignore malformed messages
            console.error('Error processing message:', e)
        }
    })

    ws.on('close', () => {
        if (joinedGame && clientId) {
            const room = games.get(joinedGame)
            if (room) {
                room.delete(ws)
                // Notify others in the room
                for (const [otherWs] of room.entries()) {
                    if (otherWs.readyState === WebSocket.OPEN) {
                        const leaveMessage: WebSocketMessage = {
                            type: 'leave',
                            id: clientId,
                            gameCode: joinedGame
                        }
                        otherWs.send(JSON.stringify(leaveMessage))
                    }
                }
                // Clean up empty rooms
                if (room.size === 0) {
                    games.delete(joinedGame)
                    console.log(`[Room Deleted] gameCode: ${joinedGame}`)
                } else {
                    console.log(`[Player Left] id: ${clientId} left gameCode: ${joinedGame}`)
                }
            }
        }
    })
})

console.log(`WebSocket server running on ws://${host}:${port}`)