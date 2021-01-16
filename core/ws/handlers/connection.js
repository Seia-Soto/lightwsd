import { nanoid } from 'nanoid'

export default (opts, debug, connection, request) => {
  'use strict'

  const {
    _ws: ws,
    _redis: redis,
    signal
  } = opts

  // NOTE: create new id and set some metadata for connection;
  connection.id = ws.id + nanoid(opts.stateLn)
  connection.createdAt = Date.now()

  // NOTE: register current connection;
  ws.connections[connection.id] = connection

  // NOTE: register to redis store;
  redis.pub.hmset('wsd:' + opts.stateNS + connection.id, ['state', 'c_est'])

  debug('connection established:', connection.id)

  signal.emit('connection.create', connection, request)
}
