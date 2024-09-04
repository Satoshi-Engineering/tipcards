import { exportSPKI } from 'jose'

import {
  getPublicKey,
} from '@backend/services/jwt.js'
import LoginInformer from '@backend/domain/auth/LoginInformer.js'
import SocketIoServer from '@backend/services/SocketIoServer.js'
import LnurlServer from '@backend/services/LnurlServer.js'
import LnurlAuthLogin from '@backend/domain/auth/LnurlAuthLogin.js'
export default class Auth {
  public static async getPublicKey() {
    const publicKey = await getPublicKey()
    const spkiPem = await exportSPKI(publicKey)
    return spkiPem
  }

  public static init() {
    if (Auth.singleton != null) {
      throw new Error('Auth already initialized!')
    }

    const loginInformer = new LoginInformer(SocketIoServer.getServer())
    const lnurlAuthLogin = new LnurlAuthLogin(
      LnurlServer.getServer(),
      loginInformer,
    )

    Auth.singleton = new Auth(lnurlAuthLogin)
  }

  static getAuth(): Auth {
    if (Auth.singleton == null) {
      throw new Error('Auth getAuth called before init!')
    }

    return Auth.singleton
  }

  private static singleton: Auth

  private lnurlAuthLogin: LnurlAuthLogin

  private constructor(lnurlAuthLogin: LnurlAuthLogin) {
    this.lnurlAuthLogin = lnurlAuthLogin
  }

  public getLnurlAuthLogin(): LnurlAuthLogin {
    return this.lnurlAuthLogin
  }
}
