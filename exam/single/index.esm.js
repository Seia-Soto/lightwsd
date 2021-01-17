import WebSocket from 'ws'

import lightwsd from '../../index'
import { createLogger } from '../../utils'

const server = async port => {
  const debug = createLogger('exam/server')

  debug('starting test server on port', port)

  const { fns, signal } = await lightwsd({
    ws: {
      port
    }
  })

  signal.on('connection.create', async (connection, request) => {
    debug('connected:', connection.id)
    debug('sending data with ws built-in method')

    connection.send('asdf')

    debug('sending data with fns helper functions')

    fns.send(connection.id, 'asdf')
  })

  client()
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
