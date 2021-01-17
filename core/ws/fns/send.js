export default (opts, connectionId, payload, options) => {
  'use strict'

  const {
    _ws: ws,
    _redis: redis
  } = opts
  const {
    debug
  } = ws

  payload = payload || ''
  options = options || {}

  return new Promise((resolve, reject) => {
    if (!ws) {
      const message = 'aborting, websocket server instance not found'

      debug(message)
      reject(message)

      return
    }

    payload = payload || {}

    const payloadType = typeof payload

    if (payloadType === 'object') {
      payload = JSON.stringify(payload)
    } else if (payloadType !== 'string') {
      payload = String(payload)
    }

    const connection = ws.connections[connectionId]

    if (connection) {
      connection.send(payload, options, () => resolve())

      return
    }

    const key = 'wsd:' + opts.stateNS + connectionId

    debug('sending data though another websocket identified by:', key)

    redis.pub.hget(key, ['state'], (error, result) => {
      if (error || !result) {
        const message = 'aborting, error occured or socket connection is not existing: ' + error

        debug(message)
        reject(message)

        return
      }

      const state = {
        action: 'send',
        destination: connectionId,
        options,
        payload
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
