import { exportSPKI } from 'jose'
import { Server } from 'http'

import {
  getPublicKey,
} from '@backend/services/jwt.js'
import LoginInformer from '@backend/domain/auth/LoginInformer.js'
import SocketIoServer from '@backend/domain/auth/services/SocketIoServer.js'
import LnurlServer from '@backend/domain/auth/services/LnurlServer.js'
import LnurlAuthLogin from '@backend/domain/auth/LnurlAuthLogin.js'

export default class Auth {
  public static startup(server: Server) {
    SocketIoServer.init(server)
    /* eslint-disable-next-line no-console */
    console.info(' - Auth - WebSocket initialized')

    LnurlServer.init()
    /* eslint-disable-next-line no-console */
    console.info(' - Auth - LnurlServer initialized')
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

  public static async getPublicKey() {
    const publicKey = await getPublicKey()
    const spkiPem = await exportSPKI(publicKey)
    return spkiPem
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
