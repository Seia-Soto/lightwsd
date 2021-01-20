import { attachHandlers, createLogger } from '../../utils'
import * as handlers from './handlers'

const debug = createLogger('redis')

export default (client, opts) => {
  return new Promise((resolve, reject) => {
    client.once('ready', () => {
      debug('redis client started')

      // NOTE: set some metadata and helper objects for redis client;
      client.debug = debug

      // NOTE: attach event handlers;
      attachHandlers(client, handlers, opts, debug)

      // NOTE: if all clients are in ready-state.
      resolve(client)
    })
  })
}
