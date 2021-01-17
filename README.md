# Seia-Soto/lightwsd

A redis based horizontal scalable websocket server handler, specially for project Yeonit.
And a lightweight essential Socket.io replacement staying with standard WebSocket which has better memory-usage and only essential functionalities.

> **Warning**
>
> This project isn't tested yet!

## Table of Contents

- [Development](#development)
- [Scripts](#scripts)
- [Usage](#usage)
- [API](#api)

----

# Development

The goal of this repository is sharing minimal states between websocket clusters which socket.io does with redis.
However, even native WebSocket support is current from IE10, I don't need complex functionalities from socket.io.
Socket.io contains not only websocket related functions, also it does some tricks such as polling strategy which have poor-performance.
So, I thought that using native WebSocket features are better for both client and server, even gaining a lot of performance.

## About uWebSocket.js

I have a lot of interest of uWebSocket.js which is a part of uNetworking, also, the next version of uws at the time.
It has surprising performance even from Linux kernel but I couldn't use that because of leak of server instance sharing feature.
I know that library is written on C++ for performance and adopts uWebSocket's features perfectly.
However, sharing HTTP server instance has a lot of advantage at the time because HTTP server and WebSocket server's variables can be shared.
Because using server instance provided by uWebSocket.js is hard for existing projects, I decided to work with ws package as a secondary shot.

## TODO

Always, everything might not be implemented.

- Broadcasting
- Rooms

## Dependencies

I am selecting the fastest client/server package referring to public benchmark results, and currently, I am using following packages in this repository.

- WebSocket: handled by [ws](https://www.npmjs.com/package/ws)
- Redis: handled by [node-redis](https://www.npmjs.com/package/redis)
- Random: handled by [nanoid](https://www.npmjs.com/package/nanoid)
- Events: handled by [eventemitter3](https://www.npmjs.com/package/eventemitter3)
- Debugger: handled by [debug](https://www.npmjs.com/package/debug)

### Refs

- [poppinlp/node_redis-vs-ioredis](https://github.com/poppinlp/node_redis-vs-ioredis)
- [theturtle32.github.io/WebSocket-Node/benchmarks](http://theturtle32.github.io/WebSocket-Node/benchmarks/)
- [ai/nanoid](https://www.npmjs.com/package/nanoid#benchmark)
- [primus/eventemitter3](https://github.com/primus/eventemitter3/tree/master/benchmarks)

## Additional Node.JS tweaks/modules

Also, following modules are used to enhance the experience.

- [esm](https://www.npmjs.com/package/esm)
- [v8-compile-cache](https://www.npmjs.com/package/v8-compile-cache)

## Standard.JS

I do Standard.JS.

[![JavaScript Style Guide](https://cdn.rawgit.com/standard/standard/master/badge.svg)](https://github.com/standard/standard)

# Scripts

## `yarn test`

Currently, jest test suite isn't available, yet.

## `yarn exam[:mode]`

Runs a single test server on port `8081` and create a temporal client to test manually.

### Possible values for `:mode`

- (null)
- single
- multi

## `yarn lint`

Runs ESlint to test syntax.

# Usage

You can import `lightwsd` function by installing this repository as module.
By calling function `lightwsd` will extend your options which is first argument.

```js
// NOTE: import package.
const { default: lightwsd } = require('Seia-Soto/lightwsd')

// NOTE: simple trick to bypass eslint rules(standard) and use IIFE in ES6.
module.exports = (async () => {
  // NOTE: launch!
  const opts = {
    ws: {
      // NOTE: you can port this project to another Node.JS HTTP server projects such as Fastify by specifying existing server argument.
      port: 8080
    }, // NOTE: ws.Server options;
    redis: {} // NOTE: node-redis options;
  }

  // NOTE: you can export `fns` and `signal` from the function.
  const { fns, signal } = await lightwsd(opts)

  // NOTE: use every shards, clusters, workers, ...and a lot!
  signal.on('connection.create', async (connection, request) => {
    const payload = {
      hello: 'world'
    }
    const options = {}

    // NOTE: just use built-in `send` function in ws package.
    connection.send(payload, options)

    // NOTE: if you want to send payload from another cluster only thing you need to specify is `connection.id`.
    await fns.send(connection.id, payload, options)

    console.log('message sent to', connection.id, payload)
  })
})()
```

## ESM

This project also have built-in support for ESM module provided by ESM module on NPM as the current flow of JavaScript module is moving to ESM.

```js
import lightwsd from 'lightwsd'

// NOTE: usage is same;
```

# API

You can start with [usage](#usage) section and save `fns` and `signal` variables as one module.

## `lightwsd([opts])`

- `stateLn` (optional number, default: `10`) The length of state id for each websocket and connection.
- `stateNS` (optional string, default: `lightwsd`) The name of global namespace for state sharing.
- `ws` (optional object, default: `{}`) The options for ws.Server.
- `redis` (optional object, default: `{}`) The options for redis.createClient.
- `signal` (optional, default: `EventEmitter3`) instanced EventEmitter, or lightwsd will use EventEmitter3.
- `_redis` (optional, default: `object` of `RedisClient`) The redis client already in ready-state.
- `_ws` (optional, default: `WebSocket.Server`) The websocket server already instanced.

A function which extends your lightwsd options, will return promise.
Calling this function will make two Redis connection and one websocket server.
If you need to re-use existing redis connection, you should use `_redis.pub` instead of `_redis.sub` which is in subscribe mode.

> **Warning**
>
> If you're directly accessing `lightwsd.fns` without passing `lightwsd` function, you need to set `opts` as first argument.

```js
lightwsd({
  ws: {
    port: 8080
  },
  redis: {}
})
  .then(extendedOpts => {
    const {
      stateNS,
      _ws, // NOTE: Websocket instance;
      _redis: {
        pub, // NOTE: RedisClient publisher instance;
        sub // NOTE: RedisClient instance in subscribe mode* (duplicated client);
      },
      signal, // NOTE: internal EventEmitter;
      fns // NOTE: prepared* internal helper functions;
    } = extendedOpts
  })
```

### Event: `'connection.create'`

- `connection` (WebSocket) The websocket connection.
- `request` (WebSocket.Request) The request object provided with WebSocket connection object.

Lightwsd will emit event `connection.create` when new connection is upgraded from HTTP request.
Also, we add `id` property to `connection` object.

### Event: `'connection.delete'`

- `connectionId` (string) The websocket connection id which released.

Lightwsd will emit event `connection.delete` when connection is closed.
I recommend you to handle this event instead of `close` event from ws object because this event will be emitted after deletion from `ws.connections` object internally.

### `lightwsd.fns.send(connectionId, [payload], [options])`

- `connectionId` (required string, no default) The websocket connection id to send payload.
- `payload` (optional any, default: `{}`) The payload to send to websocket connection.
- `options` (optional object, default: `{}`) The options passed to `connection.send` function of connection instance of ws package.

A helper function to send payload across websocket clusters, this function will send payload using existing websocket connection instance if available.
This function will return promise and end it when payload sent or event sent via redis store.
If `connectionId` is invalid or not found (or WebSocket.Server instance not found), the returned promise will be rejected.

```js
const { fns } = await lightwsd()

await fns.send(connectionId, { hello: 'world' })

console.log('message send!')
```

# LICENSE

Current project is distributed under [MIT License](./LICENSE).
