export default (opts, connectionId, payload, options) => {
  'use strict'

  const {
    _ws: ws,
    _redis: redis,
    debug
  } = opts

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
    } else {
      payload = String(payload)
    }

    const connection = ws.connections[connectionId]

    if (connection) {
      connection.send(payload, options, () => resolve())

      return
    }

    const key = 'wsd:' + opts.stateNS + connectionId

    redis.pub.hget(key, (error, result) => {
      if (error || !result) {
        const message = 'aborting, error occured or socket connection is not existing: ' + error

        debug(message)
        reject(message)

        return
      }

      redis.pub.hmset(
        key,
        [
          'action',
          'send',
          'options',
          JSON.stringify(options),
          'payload',
          payload
        ], error => {
          if (error) reject(error)

          resolve(error)
        }
      )
    })
  })
}
