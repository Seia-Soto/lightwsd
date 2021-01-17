import ws from 'ws'
import { nanoid } from 'nanoid'

import { attachHandlers, createLogger } from '../../utils'
import * as handlers from './handlers'

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
      const channel = 'wsd:' + opts.stateNS + wss.id

      opts._redis.sub.psubscribe(channel + '*')

      debug('subscribing channel:', channel)

      // NOTE: register to global event waitlist;
      opts._redis.pub.hmset('wsd:' + opts.stateNS, [wss.id, 1])

      debug('subscribing global events')

      // NOTE: attach event handlers;
      attachHandlers(wss, handlers, opts, debug)

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
