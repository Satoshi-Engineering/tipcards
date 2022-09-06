let EXPRESS_PORT = 4000
if (Number(process.env.EXPRESS_PORT) > 0 && Number(process.env.EXPRESS_PORT) < 65536) {
  EXPRESS_PORT = Number(process.env.EXPRESS_PORT)
}

let REDIS_BASE_PATH = 'server:develop'
if (typeof process.env.REDIS_BASE_PATH === 'string' && process.env.REDIS_BASE_PATH.length > 0) {
  REDIS_BASE_PATH = process.env.REDIS_BASE_PATH
}

export {
  EXPRESS_PORT,
  REDIS_BASE_PATH,
}
