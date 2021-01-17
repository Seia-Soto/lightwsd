export default (opts, connectionId) => {
  'use strict'

  const {
    _ws: ws,
    _redis: redis
  } = opts
  const {
    debug
  } = ws

  return new Promise((resolve, reject) => {
    if (!ws) {
      const message = 'aborting, websocket server instance not found'

      debug(message)
      reject(message)

      return
    }

    const connection = ws.connections[connectionId]

    if (connection) {
      connection.terminate()
      resolve()

      return
    }

    const key = 'wsd:' + opts.stateNS + connectionId

    debug('closing another websocket identified by:', key)

    redis.pub.hget(key, ['state'], (error, result) => {
      if (error || !result) {
        const message = 'aborting, error occured or socket connection is not existing: ' + error

        debug(message)
        reject(message)

        return
      }

      const state = {
        action: 'close',
        destination: connectionId
      }

      redis.pub.publish(key, JSON.stringify(state), error => {
        if (error) {
          const message = 'aborting, error occured while publishing event to redis store: ' + error

          debug(message)
          reject(message)
        }

        resolve()
      })
    })
  })
}
