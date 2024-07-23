import type { CorsOptions } from 'cors'

import { getAllLandingPages } from '@backend/database/deprecated/queries.js'
import {
  TIPCARDS_ORIGIN,
  CORS_WHITELIST_EXTEND,
} from '@backend/constants.js'

const whitelist = [
  TIPCARDS_ORIGIN,
  ...CORS_WHITELIST_EXTEND,
]
export async function loadCoarsWhitelist() {
  try {
    const landingPages = await getAllLandingPages()
    landingPages.forEach((landingPage) => {
      if (landingPage.url == null) {
        return
      }
      whitelist.push(new URL(landingPage.url).origin)
    })
  } catch (error) {
    console.error('Unable to load landingPages for cors whitelisting', error)
  }
}

const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    if (typeof origin === 'string' && !whitelist.includes(origin)) {
      callback(null, false)
      return
    }
    callback(null, true)
  },
  credentials: true,
}

export default corsOptions
