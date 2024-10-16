import z from 'zod'

import { ErrorCode } from '@shared/data/Errors.js'

/////
// ------------------- READ FROM .env FILE -------------------

/////
// LNURL JWT AUTH
const JWT_AUTH_KEY_DIRECTORY = process.env.JWT_AUTH_KEY_DIRECTORY || ''
const LNURL_AUTH_DEBUG = process.env.LNURL_AUTH_DEBUG === '1'

let LNURL_SERVICE_ORIGIN: string
try {
  LNURL_SERVICE_ORIGIN = z.string().parse(process.env.LNURL_SERVICE_ORIGIN)
} catch (error) {
  console.error(ErrorCode.UnableToParseEnvVar, {
    error,
    constant: 'LNURL_SERVICE_ORIGIN',
    envValue: process.env.LNURL_SERVICE_ORIGIN,
  })
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
  LNURL_AUTH_DEBUG,
  LOGINHASH_EXPIRATION_TIME,
  REFRESH_TOKEN_EXPIRATION_TIME,
  ACCESS_TOKEN_EXPIRATION_TIME,
}
