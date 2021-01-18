export default opts => {
  'use strict'

  const {
    _ws: ws,
    _redis: redis
  } = opts
  const {
    debug
  } = ws

  return new Promise((resolve, reject) => {
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
        action: 'exit'
      }
      const post = JSON.stringify(state)

      for (const wsId in result) {
        const server = 'wsd:' + opts.stateNS + wsId

        debug('sending exit signal to:', server)

        redis.pub.publish(server, post)
      }

      resolve()
    })
  })
}
