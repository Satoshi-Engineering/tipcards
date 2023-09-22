import type { CorsOptions } from 'cors'

import { getAllLandingPages } from './database'
import {
  TIPCARDS_ORIGIN,
  CORS_WHITELIST_EXTEND,
  JWT_AUDIENCES_PER_ISSUER,
} from '../constants'

const whitelist = [
  TIPCARDS_ORIGIN,
  ...CORS_WHITELIST_EXTEND,
  ...Object
    .values(JWT_AUDIENCES_PER_ISSUER)
    .reduce((audiences, audiencesPerIssuer) => [...audiences, ...audiencesPerIssuer], []),
]
;(async () => {
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
})()
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
