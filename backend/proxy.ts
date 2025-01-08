import http from 'http'
import httpProxy from 'http-proxy'
import HttpProxyRules from 'http-proxy-rules'

import '@backend/initEnv.js' // Info: .env needs to read before imports

import {
  EXPRESS_PORT,
  PROXY_PORT,
  WEB_PORT,
} from '@backend/constants.js'
import { LNURL_PORT } from '@auth/constants.js'

const proxyRules = new HttpProxyRules({
  rules: {
    '/api(.*)': `http://localhost:${EXPRESS_PORT}/api/$1`,
    '/trpc(.*)': `http://localhost:${EXPRESS_PORT}/trpc/$1`,
    '/auth/trpc(.*)': `http://localhost:${EXPRESS_PORT}/auth/trpc/$1`,
    '/lnurl(.*)': `http://localhost:${LNURL_PORT}/lnurl/$1`,
    '/(.*)': `http://localhost:${WEB_PORT}/$1`,
  },
})

const proxy = httpProxy.createProxy()

http
  .createServer((req, res)  => {
    const target = proxyRules.match(req)
    if (target == null) {
      res.writeHead(500, { 'Content-Type': 'text/plain' })
      res.end('The request url and path did not match any of the listed rules!')
      return
    }
    return proxy.web(req, res, {
      target: target,
    })
  })
  .listen(PROXY_PORT)
  .on('listening', () => {
    /* eslint-disable-next-line no-console */
    console.info(`proxy running on ${PROXY_PORT}`)
  })
