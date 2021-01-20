import EventEmitter from 'eventemitter3'

import { ws, redis } from './core'
import { attachArgs } from './utils'
import pkg from './package.json'

const lightwsd = async opts => {
  'use strict'

  opts = opts || {}
  // NOTE: define namespace length;
  opts.stateLn = opts.stateLn || 10
  // NOTE: define namespace name;
  opts.stateNS = opts.stateNS || pkg.name

  // NOTE: prepare opts per instances;
  opts.ws = Object.assign({}, opts.ws)
  opts.redis = Object.assign({}, opts.redis)

  // NOTE: create event emitter;
  opts.signal = opts.signal || new EventEmitter()

  // NOTE: create redis and websocket server instance;
  if (!opts._redis) {
    opts._redis = await redis.createClient(opts)
  } else {
    // NOTE: duplicate client when redis instance provided;
    opts._redis = {
      pub: opts._redis,
      sub: await redis.duplicate(opts._redis)
    }
    await redis.init(opts._redis.sub)
  }
  if (!opts._ws) opts._ws = await ws.createServer(opts)

  // NOTE: bind current `opts` to functions;
  opts.fns = attachArgs(ws.fns, opts)

  // NOTE: return opts;
  return opts
}

export default lightwsd
