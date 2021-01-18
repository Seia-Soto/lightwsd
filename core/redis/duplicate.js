export default client => {
  return new Promise((resolve, reject) => {
    client.duplicate(undefined, sub => resolve(sub))
  })
}
