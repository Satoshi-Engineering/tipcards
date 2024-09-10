import { exportSPKI } from 'jose'
import { Server } from 'http'

import { ErrorCode } from '@shared/data/Errors.js'

import type { User } from '@backend/database/deprecated/data/User.js'
import { getUserByLnurlAuthKeyOrCreateNew, updateUser } from '@backend/database/deprecated/queries.js'
import {
  getPublicKey,
  createRefreshToken,
  createAccessToken,
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

  public async loginWithLnurlAuthHash(hash: string): Promise<{ accessToken: string, refreshToken: string }> {
    if (!this.lnurlAuthLogin.isOneTimeLoginHashValid(hash)) {
      throw new Error('Hash not found')
    }
    const walletPublicKey = this.lnurlAuthLogin.getPublicKeyFromOneTimeLoginHash(hash)

    let user: User
    try {
      // Deprecated Function
      user = await getUserByLnurlAuthKeyOrCreateNew(walletPublicKey)
    } catch (error) {
      console.error(ErrorCode.UnableToGetOrCreateUserByLnurlAuthKey, error)
      throw new Error(`${ErrorCode.UnableToGetOrCreateUserByLnurlAuthKey} - Unable to get or create user`)
    }

    const refreshToken = await createRefreshToken(user)
    if (user.allowedRefreshTokens == null) {
      user.allowedRefreshTokens = []
    }
    user.allowedRefreshTokens.push([refreshToken])

    try {
      // Deprecated Function
      await updateUser(user)
    } catch (error) {
      console.error(ErrorCode.UnableToUpdateUser, error)
      throw new Error(`${ErrorCode.UnableToUpdateUser} - Unable to update user authentication`)
    }

    // split access token in extra function?
    const accessToken = await createAccessToken(user)
    this.lnurlAuthLogin.invalidateLoginHash(hash)
    return {
      refreshToken,
      accessToken,
    }
  }
}
