import axios from 'axios'

import { delay } from './timingUtils.js'

/**
 * if we are too fast we need to try multiple times
 * https://gitlab.satoshiengineering.com/satoshiengineering/projects/-/issues/825
 *
 * @throws
 * */
export const retryGetRequestWithDelayUntilSuccessWithMaxAttempts = async (url: string, maxRetrys = 5, delayInMilliseconds = 200) => {
  let caughtError: unknown
  while (maxRetrys > 0) {
    try {
      return await axios.get(url)
    } catch (error) {
      caughtError = error
      await delay(delayInMilliseconds)
      maxRetrys--
    }
  }
  throw caughtError
}
