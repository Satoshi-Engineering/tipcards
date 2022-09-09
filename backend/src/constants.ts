let EXPRESS_PORT = 4000
if (Number(process.env.EXPRESS_PORT) > 0 && Number(process.env.EXPRESS_PORT) < 65536) {
  EXPRESS_PORT = Number(process.env.EXPRESS_PORT)
}

let REDIS_BASE_PATH = 'tipcards:develop'
if (typeof process.env.REDIS_BASE_PATH === 'string' && process.env.REDIS_BASE_PATH.length > 0) {
  REDIS_BASE_PATH = process.env.REDIS_BASE_PATH
}

export {
  EXPRESS_PORT,
  REDIS_BASE_PATH,
}

export const TIPCARDS_ORIGIN = process.env.TIPCARDS_ORIGIN || ''
export const TIPCARDS_API_ORIGIN = process.env.TIPCARDS_API_ORIGIN || ''
export const LNBITS_INVOICE_READ_KEY = process.env.LNBITS_INVOICE_READ_KEY || ''
export const LNBITS_ADMIN_KEY = process.env.LNBITS_ADMIN_KEY || ''
