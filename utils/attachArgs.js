export default (fns, ...bind) => {
  const fnNames = Object.keys(fns)

  for (let i = 0, l = fnNames.length; i < l; i++) {
    const fnName = fnNames[i]

    fns[fnName] = fns[fnName].bind(null/* this */, ...bind/* push args */)
  }

  return fns
}
