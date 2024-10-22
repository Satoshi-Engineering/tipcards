export default class LoginInformer {
  public async waitForLogin(hash: string) {
    if (this.callbackByHash[hash] == null) {
      this.callbackByHash[hash] = []
    }
    return new Promise((resolve, reject) => {
      this.callbackByHash[hash].push({
        resolve,
        reject,
      })
    })
  }

  public emitLoginSuccessful(hash: string) {
    if (this.callbackByHash[hash] == null) {
      return
    }

    this.callbackByHash[hash].forEach(({ resolve }) => {
      resolve()
    })
    this.callbackByHash[hash] = []
  }

  public emitLoginFailed(hash: string) {
    if (this.callbackByHash[hash] == null) {
      return
    }

    this.callbackByHash[hash].forEach(({ reject }) => {
      reject()
    })
    this.callbackByHash[hash] = []
  }

  private callbackByHash: Record<string, {
    resolve: (value?: unknown) => void
    reject: () => void
  }[]> = {}
}
