import type { TestAPI } from 'vitest'
export default class FailEarly {
  // testName: string | undefined
  failed = false
  vitestIt: TestAPI

  constructor(vitestIt: TestAPI) {
    this.vitestIt = vitestIt
  }

  test(name: string, test: () => Promise<void>, timeout?: number) {
    const failEarlyFn = async () => {
      if (this.failed) {
        throw new Error('Previous test failed, skipping this test by throwing this error')
      }

      try {
        await test()
      } catch (error) {
        // this.testName = name
        this.failed = true
        throw error
      }
    }

    this.vitestIt(name, failEarlyFn, timeout)
  }

  it(name: string, test: () => Promise<void>, timeout?: number) {
    this.test(name, test, timeout)
  }
}
