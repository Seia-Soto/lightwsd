import WebSocket from 'ws'

import lightwsd from '../../index'
import { createLogger } from '../../utils'

let connections = 0
let messages = 0

const server = async port => {
  const debug = createLogger('exam/server')

  debug('starting test server on port', port)

  const { fns, signal } = await lightwsd({
    ws: {
      port
    }
  })

  for (let i = 0; i < 10; i++) {
    client(port)
  }

  signal.on('connection.create', async (connection, request) => {
    debug('connected:', connection.id)

    debug('opening new server to send message')

    connections++

    if (connections >= 10) {
      fns.broadcast({ mesage: 'broadcasting' })
    }
  })
}
const client = async port => {
  const debug = createLogger('exam/client#' + Math.random().toString(32).slice(2))

  debug('connecting to server')

  const ws = new WebSocket('ws://localhost:' + port)

  ws.on('open', () => debug('open'))
  ws.on('message', data => {
    debug('incoming:', data)

    if (++messages >= 10) process.exit(0)
  })
}

server(8081)
