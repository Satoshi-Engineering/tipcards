import axios, { AxiosResponse } from 'axios'
import { ZodSchema } from 'zod'

import { delay } from './timingUtils.js'

/**
 * if we are too fast we need to try multiple times
 * https://gitlab.satoshiengineering.com/satoshiengineering/projects/-/issues/825
 *
 * @throws
 * */
export const retryGetRequestWithDelayUntilSuccessWithMaxAttempts = async (
  url: string,
  immediateWait = false,
  maxRetrys = 5,
  delayInMilliseconds = 200,
): Promise<AxiosResponse> => {
  let caughtError: unknown
  for (let x = 0; x < maxRetrys; x += 1) {
    if (immediateWait || x > 0) {
      await delay(delayInMilliseconds)
    }
    try {
      const response = await axios.get(url)
      return response
    } catch (error) {
      caughtError = error
    }
  }
  throw caughtError
}

export const retryGetRequestWithDelayUntilSuccessWithMaxAttemptsAndSchema = async <T>(
  url: string,
  schema: ZodSchema<T>,
  immediateWait = false,
  maxRetrys = 5,
  delayInMilliseconds = 200,
): Promise<T> => {
  let caughtError: unknown
  for (let x = 0; x < maxRetrys; x += 1) {
    if (immediateWait || x > 0) {
      await delay(delayInMilliseconds)
    }
    try {
      const response = await axios.get(url)
      return schema.parse(response.data)
    } catch (error) {
      caughtError = error
    }
  }
  throw caughtError
}
