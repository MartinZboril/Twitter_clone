import { WebSocketServer } from "ws"

const connections = new Set()

export const createWebSocketServer = (server) => {
  const wss = new WebSocketServer({ server })

  wss.on('connection', (ws) => {
    connections.add(ws)

    ws.on('close', () => {
      connections.delete(ws)
    })
  })
}
