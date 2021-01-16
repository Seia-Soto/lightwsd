import redis from 'redis'

import { attachHandlers, createLogger } from '../../utils'
import * as handlers from './handlers'

const debug = createLogger('redis')

export default opts => {
  return new Promise((resolve, reject) => {
    const { redis: redisOpts } = opts
    const clients = {
      pub: redis.createClient(redisOpts),
      sub: redis.createClient(redisOpts)
    }

    let readyState = 0

    const init = client => {
      client.once('ready', () => {
        debug('redis client started')

        // NOTE: set some metadata and helper objects for redis client;
        client.debug = debug

        // NOTE: attach event handlers;
        attachHandlers(client, handlers, opts, debug)

        readyState += 1

        // NOTE: if all clients are in ready-state.
        if (readyState > 1) {
          resolve(clients)
        }
      })
    }

    init(clients.pub)
    init(clients.sub)
  })
}
