import ws from 'ws'
import { nanoid } from 'nanoid'

import { attachHandlers, createLogger } from '../../utils'
import handlers from './handlers'

const debug = createLogger('ws')

export default opts => {
  const { ws: wsOpts } = opts

  return new Promise((resolve, reject) => {
    const init = wss => {
      // NOTE: set some metadata and helper objects for websocket server;
      wss.id = nanoid(opts.stateLn)
      wss.debug = debug
      wss.connections = {}

      // NOTE: start listening events;
      const channel = 'wsd:' + wss.id + '*'

      opts._redis.sub.psubscribe(channel)

      debug('subscribing channel:', channel)

      // NOTE: attach event handlers;
      attachHandlers(wss, handlers, debug, opts)

      // NOTE: return to root object;
      resolve(wss)
    }

    const server = new ws.Server(wsOpts, () => {
      debug('internal websocket server started by ws package')

      init(server)
    })

    if (opts.mode === 'noServer' || opts.server) init(server)
  })
}