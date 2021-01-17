export default async (opts, debug, pattern, channel, message) => {
  try {
    message = JSON.parse(message)

    switch (message.action) {
      case 'send': {
        const {
          options,
          payload,
          destination
        } = message
        const valid =
          (payload) &&
          (destination)
        if (!valid) return

        opts._ws.connections[destination].send(payload, options)

        break
      }
      case 'broadcast': {
        const {
          options,
          payload
        } = message
        const valid =
          (payload)
        if (!valid) return

        for (const connection in opts._ws.connections) {
          opts._ws.connections[connection].send(payload, options)
        }

        break
      }
      default: throw new Error()
    }
  } catch (error) {
    if (error) {
      debug('error while handling event:', error)
    }

    debug('received invalid signal:', message)
  }
}
