import { TIPCARDS_API_ORIGIN } from '@backend/constants.js'

/////
// ------------------- READ FROM .env FILE -------------------

/////
// LNURL JWT AUTH
const JWT_AUTH_KEY_DIRECTORY = process.env.JWT_AUTH_KEY_DIRECTORY || ''

let LNURL_SERVICE_ORIGIN = TIPCARDS_API_ORIGIN
if (typeof process.env.LNURL_SERVICE_ORIGIN === 'string' && process.env.LNURL_SERVICE_ORIGIN.length > 0) {
  LNURL_SERVICE_ORIGIN = process.env.LNURL_SERVICE_ORIGIN
}

let LNURL_PORT = 4001
if (Number(process.env.LNURL_PORT) > 0 && Number(process.env.LNURL_PORT) < 65536) {
  LNURL_PORT = Number(process.env.LNURL_PORT)
}


/////
// ------------------- APPLICATION CONSTANTANTS --------------

/////
// LoginInformer
const LOGINHASH_EXPIRATION_TIME = 1000 * 60 * 15

/////
// RefreshGuard
const REFRESH_TOKEN_EXPIRATION_TIME = '28 days'
const ACCESS_TOKEN_EXPIRATION_TIME = '5 min'


/////
// ------------------- NGROK OVERRIDES -----------------------
if (typeof process.env.NGROK_OVERRIDE === 'string' && process.env.NGROK_OVERRIDE.length > 0) {
  LNURL_SERVICE_ORIGIN = process.env.NGROK_OVERRIDE
}

export {
  JWT_AUTH_KEY_DIRECTORY,
  LNURL_SERVICE_ORIGIN,
  LNURL_PORT,
  LOGINHASH_EXPIRATION_TIME,
  REFRESH_TOKEN_EXPIRATION_TIME,
  ACCESS_TOKEN_EXPIRATION_TIME,
}
