import ngrok from 'ngrok'

import '@backend/initEnv.js' // Info: .env needs to read before imports

import { PROXY_PORT, NGROK_AUTH_TOKEN } from '@backend/constants.js'

(async () => {
  const url = await ngrok.connect({
    addr: PROXY_PORT,
    authtoken: NGROK_AUTH_TOKEN,
  })
  /* eslint-disable */
  console.info(`ngrok running on ${url}`)
})()
