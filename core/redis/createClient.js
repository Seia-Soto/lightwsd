import redis from 'redis'

import { attachHandlers, createLogger } from '../../utils'
import handlers from './handlers'

const debug = createLogger('redis')

export default opts => {
  return new Promise((resolve, reject) => {
    const { redis: redisOpts } = opts

    const client = redis.createClient(redisOpts)

    client.once('ready', () => {
      debug('redis client started')

      // NOTE: set some metadata and helper objects for redis client;
      client.debug = debug

      // NOTE: attach event handlers;
      attachHandlers(client, handlers, opts, debug)

      // NOTE: create sub connection;
      client.duplicate(subClient => {
        resolve({
          pub: client,
          sub: subClient
        })
      })
    })
  })
}
