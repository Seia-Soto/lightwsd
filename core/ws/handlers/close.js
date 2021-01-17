export default (opts, debug) => {
  'use strict'

  const {
    _ws: ws,
    _redis: redis
  } = opts

  debug('cleaning up redis store')

  const query = redis.pub.multi()

  query.del('wsd:' + opts.stateNS)
  query.del('wsd:' + opts.stateNS + ws.id)

  for (const connectionId in ws.connections) {
    const key = 'wsd:' + opts.stateNS + ws.id + connectionId

    query.del(key)
  }

  query.exec((error, replies) => {
    if (error) {
      debug('error while cleaning up:', error)
    }

    debug('cleaned up')
  })
}
