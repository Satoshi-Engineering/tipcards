export default class FailEarly {
  // testName: string | undefined
  failed = false
  jestIt: jest.It

  constructor(jestIt: jest.It) {
    this.jestIt = jestIt
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

    this.jestIt(name, failEarlyFn, timeout)
  }

  it(name: string, test: () => Promise<void>, timeout?: number) {
    this.test(name, test, timeout)
  }
}
