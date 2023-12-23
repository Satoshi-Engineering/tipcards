export const delay = (ms: number) => new Promise(res => setTimeout(res, ms))

export const waitUntilWithStep = async (ms: number, retrys: number, shouldBreak: () => boolean) => {
  while (retrys > 0) {
    if (shouldBreak()) break
    await delay(100)
    retrys--
  }
}

