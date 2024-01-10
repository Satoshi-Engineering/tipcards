export const delay = (milliseconds: number) => new Promise(res => setTimeout(res, milliseconds))

export const retryFunctionWithDelayUntilSuccessWithMaxAttempts = async (isSuccess: () => boolean, maxRetrys: number, delayInMilliseconds = 100) => {
  while (maxRetrys > 0) {
    if (isSuccess()) {
      break
    }
    await delay(delayInMilliseconds)
    maxRetrys--
  }
}

