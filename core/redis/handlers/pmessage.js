export default async (opts, debug, pattern, channel, message) => {
  const validAction =
    (!message.action)
  if (!validAction) return

  switch (message.action) {
    case 'send': {
      const {
        options,
        payload
      } = message

      opts._ws.connections[channel].send(payload, options)
    }
  }
}
