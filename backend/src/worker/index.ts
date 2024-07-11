import cron from 'node-cron'

import checkDuplicateLnurlAuthKeys from './checkDuplicateLnurlAuthKeys.js'

const loop = async () => {
  try {
    await checkDuplicateLnurlAuthKeys()
  } catch (error: unknown) {
    console.error('Uncaught checkDuplicateLnurlAuthKeys error', error)
  }
}

export const initAllWorkers = () => {
  cron.schedule('*/10 * * * * *', loop)
}
