import redis from 'redis'

import init from './init'

export default async opts => {
  const { redis: redisOpts } = opts
  const clients = {
    pub: redis.createClient(redisOpts),
    sub: redis.createClient(redisOpts)
  }

  await init(clients.pub, opts)
  await init(clients.sub, opts)

  return clients
}
