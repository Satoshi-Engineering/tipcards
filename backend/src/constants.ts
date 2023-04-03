let EXPRESS_PORT = 4000
if (Number(process.env.EXPRESS_PORT) > 0 && Number(process.env.EXPRESS_PORT) < 65536) {
  EXPRESS_PORT = Number(process.env.EXPRESS_PORT)
}
let LNURL_PORT = 4001
if (Number(process.env.LNURL_PORT) > 0 && Number(process.env.LNURL_PORT) < 65536) {
  LNURL_PORT = Number(process.env.LNURL_PORT)
}
let PROXY_PORT = 4002
if (Number(process.env.PROXY_PORT) > 0 && Number(process.env.PROXY_PORT) < 65536) {
  PROXY_PORT = Number(process.env.PROXY_PORT)
}
let WEB_PORT = 5173
if (Number(process.env.WEB_PORT) > 0 && Number(process.env.WEB_PORT) < 65536) {
  WEB_PORT = Number(process.env.WEB_PORT)
}
let NGROK_AUTH_TOKEN: string | undefined = undefined
if (typeof process.env.NGROK_AUTH_TOKEN === 'string' && process.env.NGROK_AUTH_TOKEN.length > 0) {
  NGROK_AUTH_TOKEN = process.env.NGROK_AUTH_TOKEN
}

let REDIS_BASE_PATH = 'tipcards:develop'
if (typeof process.env.REDIS_BASE_PATH === 'string' && process.env.REDIS_BASE_PATH.length > 0) {
  REDIS_BASE_PATH = process.env.REDIS_BASE_PATH
}

export {
  EXPRESS_PORT,
  LNURL_PORT,
  PROXY_PORT,
  WEB_PORT,
  NGROK_AUTH_TOKEN,
  REDIS_BASE_PATH,
}

export const TIPCARDS_ORIGIN = process.env.TIPCARDS_ORIGIN || ''
export const TIPCARDS_API_ORIGIN = process.env.TIPCARDS_API_ORIGIN || ''
export const LNBITS_INVOICE_READ_KEY = process.env.LNBITS_INVOICE_READ_KEY || ''
export const LNBITS_ADMIN_KEY = process.env.LNBITS_ADMIN_KEY || ''
export const SUPPORT_TOKENS = process.env.SUPPORT_TOKENS?.split(';') || []
