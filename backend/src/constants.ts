import z from 'zod'

import { ErrorCode } from '@shared/data/Errors'

import { DB_CREDENTIALS  } from '../drizzle.config'

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

let REDIS_URL = '127.0.0.1:6379'
if (typeof process.env.REDIS_URL === 'string' && process.env.REDIS_URL.length > 0) {
  REDIS_URL = process.env.REDIS_URL
}

let LNBITS_ORIGIN = 'https://legend.lnbits.com'
if (typeof process.env.LNBITS_ORIGIN === 'string' && process.env.LNBITS_ORIGIN.length > 0) {
  LNBITS_ORIGIN = process.env.LNBITS_ORIGIN
}

let TIPCARDS_ORIGIN = process.env.TIPCARDS_ORIGIN || ''
let TIPCARDS_API_ORIGIN = process.env.TIPCARDS_API_ORIGIN || ''

let CORS_WHITELIST_EXTEND: string[] = []
if (typeof process.env.CORS_WHITELIST_EXTEND === 'string' && process.env.CORS_WHITELIST_EXTEND.length > 0) {
  try {
    CORS_WHITELIST_EXTEND = z.string().array().parse(JSON.parse(process.env.CORS_WHITELIST_EXTEND))
  } catch (error) {
    console.error(ErrorCode.UnableToParseEnvVar, {
      error,
      constant: 'CORS_WHITELIST_EXTEND',
      envValue: process.env.CORS_WHITELIST_EXTEND,
    })
  }
}

export const LNBITS_INVOICE_READ_KEY = process.env.LNBITS_INVOICE_READ_KEY || ''
export const LNBITS_ADMIN_KEY = process.env.LNBITS_ADMIN_KEY || ''
export const STATISTICS_PREPEND_FILE = process.env.STATISTICS_PREPEND_FILE || undefined
export const STATISTICS_EXCLUDE_FILE = process.env.STATISTICS_EXCLUDE_FILE || undefined

/////
// LNURL JWT AUTH
let JWT_AUTH_ORIGIN = TIPCARDS_API_ORIGIN
if (typeof process.env.JWT_AUTH_ORIGIN === 'string' && process.env.JWT_AUTH_ORIGIN.length > 0) {
  JWT_AUTH_ORIGIN = process.env.JWT_AUTH_ORIGIN
}

const JWT_AUTH_KEY_DIRECTORY = process.env.JWT_AUTH_KEY_DIRECTORY || ''

let JWT_AUTH_ISSUER = new URL(JWT_AUTH_ORIGIN).host
if (typeof process.env.JWT_AUTH_ISSUER === 'string' && process.env.JWT_AUTH_ISSUER.length > 0) {
  JWT_AUTH_ISSUER = process.env.JWT_AUTH_ISSUER
}

let JWT_AUTH_AUDIENCE = [new URL(TIPCARDS_API_ORIGIN).host]
if (typeof process.env.JWT_AUTH_AUDIENCE === 'string' && process.env.JWT_AUTH_AUDIENCE.length > 0) {
  try {
    JWT_AUTH_AUDIENCE = z
      .string().array()
      .parse(JSON.parse(process.env.JWT_AUTH_AUDIENCE))
  } catch (error) {
    console.error(ErrorCode.UnableToParseEnvVar, {
      error,
      constant: 'JWT_AUTH_AUDIENCE',
      envValue: process.env.JWT_AUTH_AUDIENCE,
    })
  }
}

/////
// NGROK
if (typeof process.env.NGROK_OVERRIDE === 'string' && process.env.NGROK_OVERRIDE.length > 0) {
  TIPCARDS_ORIGIN = process.env.NGROK_OVERRIDE
  TIPCARDS_API_ORIGIN = process.env.NGROK_OVERRIDE
  JWT_AUTH_ORIGIN = process.env.NGROK_OVERRIDE
  JWT_AUTH_ISSUER = new URL(process.env.NGROK_OVERRIDE).host
  JWT_AUTH_AUDIENCE = [new URL(process.env.NGROK_OVERRIDE).host]
}

/////
// DATABASE
const USE_DRIZZLE = process.env.USE_DRIZZLE === '1'

export {
  EXPRESS_PORT,
  LNURL_PORT,
  PROXY_PORT,
  WEB_PORT,
  NGROK_AUTH_TOKEN,
  REDIS_BASE_PATH,
  REDIS_URL,
  LNBITS_ORIGIN,
  TIPCARDS_ORIGIN,
  TIPCARDS_API_ORIGIN,
  CORS_WHITELIST_EXTEND,
  JWT_AUTH_ORIGIN,
  JWT_AUTH_KEY_DIRECTORY,
  JWT_AUTH_ISSUER,
  JWT_AUTH_AUDIENCE,
  USE_DRIZZLE,
  DB_CREDENTIALS,
}
