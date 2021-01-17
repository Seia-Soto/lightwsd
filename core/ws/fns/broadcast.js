export default (opts, payload, options) => {
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
    payload = payload || {}

    const payloadType = typeof payload

    if (payloadType === 'object') {
      payload = JSON.stringify(payload)
    } else if (payloadType !== 'string') {
      payload = String(payload)
    }

    const key = 'wsd:' + opts.stateNS

    debug('getting all servers via key:', key)

    redis.pub.hgetall(key, (error, result) => {
      if (error || !result) {
        const message = 'aborting, error occured or server map is not existing: ' + error

        debug(message)
        reject(message)

        return
      }

      const state = {
        action: 'broadcast',
        options,
        payload
      }
      const post = JSON.stringify(state)

      for (const wsId in result) {
        const server = 'wsd:' + opts.stateNS + wsId

        debug('broadcasting to:', server)

        redis.pub.publish(server, post)
      }

      resolve()
    })
  })
}
