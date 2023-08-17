import cron from 'node-cron'

import checkDuplicateLnurlAuthKeys from './checkDuplicateLnurlAuthKeys'

const loop = async () => {
  try {
    await checkDuplicateLnurlAuthKeys()
  } catch (error: unknown) {
    console.error('Uncaught checkDuplicateLnurlAuthKeys error', error)
  }
}

cron.schedule('*/10 * * * * *', loop)
