import z from 'zod'

import { ErrorCode } from '@shared/data/Errors.js'

import { DB_CREDENTIALS  } from '../drizzle.config.js'

const APP_NAME = 'Lightning TipCards Backend'

const FAILED_STARTUPS_COUNTER_DIRECTORY = process.env.FAILED_STARTUPS_COUNTER_DIRECTORY || ''

let EXPRESS_PORT = 4000
if (Number(process.env.EXPRESS_PORT) > 0 && Number(process.env.EXPRESS_PORT) < 65536) {
  EXPRESS_PORT = Number(process.env.EXPRESS_PORT)
}

let LNBITS_ORIGIN = 'https://demo.lnbits.com'
if (typeof process.env.LNBITS_ORIGIN === 'string' && process.env.LNBITS_ORIGIN.length > 0) {
  LNBITS_ORIGIN = process.env.LNBITS_ORIGIN
}

let VOLT_VAULT_ORIGIN: string | null = null
if (typeof process.env.VOLT_VAULT_ORIGIN === 'string' && process.env.VOLT_VAULT_ORIGIN.length > 0) {
  VOLT_VAULT_ORIGIN = process.env.VOLT_VAULT_ORIGIN
}

const TIPCARDS_ORIGIN = process.env.TIPCARDS_ORIGIN || ''
let TIPCARDS_API_ORIGIN = TIPCARDS_ORIGIN
if (typeof process.env.TIPCARDS_API_ORIGIN === 'string' && process.env.TIPCARDS_API_ORIGIN.length > 0) {
  TIPCARDS_API_ORIGIN = process.env.TIPCARDS_API_ORIGIN
}

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
const CROSS_ORIGIN_RESOURCES = process.env.CROSS_ORIGIN_RESOURCES === '1'

export const LNBITS_INVOICE_READ_KEY = process.env.LNBITS_INVOICE_READ_KEY || ''
export const LNBITS_ADMIN_KEY = process.env.LNBITS_ADMIN_KEY || ''
export const STATISTICS_EXCLUDE_FILE = process.env.STATISTICS_EXCLUDE_FILE || undefined

/////
// LNURL JWT AUTH
let JWT_AUTH_ISSUER = new URL(TIPCARDS_API_ORIGIN).host
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

////
// ERROR NOTIFICATION
const TELEGRAM_BOT_ID = process.env.TELEGRAM_BOT_ID
const TELEGRAM_GROUP_ID_ERROR = process.env.TELEGRAM_GROUP_ID_ERROR
const TELEGRAM_PREFIX =  process.env.TELEGRAM_PREFIX
const TELEGRAM_CHAR_MAX = Number(process.env.TELEGRAM_CHAR_MAX) || 500

export {
  APP_NAME,
  FAILED_STARTUPS_COUNTER_DIRECTORY,
  EXPRESS_PORT,
  LNBITS_ORIGIN,
  VOLT_VAULT_ORIGIN,
  TIPCARDS_ORIGIN,
  TIPCARDS_API_ORIGIN,
  CORS_WHITELIST_EXTEND,
  CROSS_ORIGIN_RESOURCES,
  JWT_AUTH_ISSUER,
  JWT_AUTH_AUDIENCE,
  DB_CREDENTIALS,
  TELEGRAM_BOT_ID,
  TELEGRAM_GROUP_ID_ERROR,
  TELEGRAM_PREFIX,
  TELEGRAM_CHAR_MAX,
}
