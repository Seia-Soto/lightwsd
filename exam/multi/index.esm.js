import WebSocket from 'ws'

import lightwsd from '../../index'
import { createLogger } from '../../utils'

let cid = 0

const server = async port => {
  const debug = createLogger('exam/server')

  debug('starting test server on port', port)

  const { fns, signal } = await lightwsd({
    ws: {
      port
    }
  })

  if (cid) {
    debug('try to send data to client:', cid)

    fns.send(cid, { hello: 'world' })
    fns.close(cid)

    return
  }

  client()

  signal.on('connection.create', async (connection, request) => {
    debug('connected:', connection.id)

    cid = connection.id

    debug('opening new server to send message')

    server(8082)
  })
}
const client = async () => {
  const debug = createLogger('exam/client')

  debug('connecting to server')

  const ws = new WebSocket('ws://localhost:8081')

  ws.on('open', () => debug('open'))
  ws.on('message', data => debug('incoming:', data))
  ws.on('close', () => {
    debug('close')
    process.exit(0)
  })
}

server(8081)
