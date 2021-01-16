export default (instance, handlers, ...bind) => {
  const handlerNames = Object.keys(handlers)

  for (let i = 0, l = handlerNames.length; i < l; i++) {
    const handlerName = handlerNames[i]

    instance.on(handlerName, handlers[handlerName].bind(null/* this */, ...bind/* push args */))
  }
}
