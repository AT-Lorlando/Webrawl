import { WebSocketServer, WebSocket } from 'ws'

// Map gameCode -> Set of client sockets and their ids
const games: Map<string, Map<WebSocket, string>> = new Map()
const host = "0.0.0.0"
const port = 3300
const wss = new WebSocketServer({ host, port })

wss.on('connection', (ws) => {
    let joinedGame: string | null = null
    let clientId: string | null = null

    ws.on('message', (data) => {
        try {
            const msg = JSON.parse(data.toString())
            if ((msg.type === 'host' || msg.type === 'join') && msg.gameCode && msg.id) {
                const gameCode = msg.gameCode
                joinedGame = gameCode
                clientId = msg.id
                if (!games.has(gameCode)) {
                    games.set(gameCode, new Map())
                    console.log(`[Room Created] gameCode: ${gameCode}`)
                }
                const room = games.get(gameCode)
                if (room && clientId) {
                    room.set(ws, clientId)
                    console.log(`[Player ${msg.type === 'host' ? 'Host' : 'Join'}] id: ${clientId} joined gameCode: ${gameCode}`)
                    for (const [otherWs, otherId] of room.entries()) {
                        if (otherWs !== ws && otherWs.readyState === WebSocket.OPEN) {
                            otherWs.send(JSON.stringify({
                                type: 'join',
                                id: clientId,
                            }))
                            console.log(`Sent join message to ${otherId}`)
                        }
                    }
                }
                console.log(`[Room State] gameCode: ${gameCode} players: ${Array.from(room?.keys() || []).map(ws => room?.get(ws))
                    .filter(Boolean)
                    .join(', ')}`)
            } else if (msg.type === 'state' && msg.gameCode && msg.id && msg.position && joinedGame && clientId) {
                const gameCode = msg.gameCode
                const room = games.get(gameCode)
                if (room) {
                    for (const [otherWs, otherId] of room.entries()) {
                        if (otherWs !== ws && otherWs.readyState === WebSocket.OPEN) {
                            otherWs.send(JSON.stringify({
                                type: 'state',
                                id: clientId,
                                position: msg.position
                            }))
                        }
                    }
                }
            }
        } catch (e) {
            // Ignore malformed messages
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
                        otherWs.send(JSON.stringify({
                            type: 'leave',
                            id: clientId
                        }))
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