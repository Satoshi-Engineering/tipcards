import 'dotenv/config'
import ngrok from 'ngrok'

import { PROXY_PORT, NGROK_AUTH_TOKEN } from './src/constants'

(async () => {
  const url = await ngrok.connect({
    addr: PROXY_PORT,
    authtoken: NGROK_AUTH_TOKEN,
  })
  /* eslint-disable */
  console.info(`ngrok running on ${url}`)
})()
