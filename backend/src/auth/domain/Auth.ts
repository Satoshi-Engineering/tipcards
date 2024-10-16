import { Server } from 'http'

import { JWT_AUTH_ISSUER } from '@backend/constants.js'

import JwtIssuer from '@shared/modules/Jwt/JwtIssuer.js'
import JwtKeyPairHandler from '@shared/modules/Jwt/JwtKeyPairHandler.js'

import { JWT_AUTH_KEY_DIRECTORY } from '@auth/constants.js'
import LoginInformer from '@auth/domain/LoginInformer.js'
import SocketIoServer from '@auth/services/SocketIoServer.js'
import LnurlServer from '@auth/services/LnurlServer.js'
import LnurlAuthLogin from '@auth/domain/LnurlAuthLogin.js'

export default class Auth {
  public static async init(accessTokenAudience: string[] | string) {
    if (Auth.singleton != null) {
      throw new Error('Auth already initialized!')
    }

    const loginInformer = new LoginInformer(SocketIoServer.getServer())
    const lnurlAuthLogin = new LnurlAuthLogin(
      LnurlServer.getServer(),
      loginInformer,
    )

    const keyPair = await Auth.loadKeyPairOrGenerateAndSaveKeyPairToDirectory(JWT_AUTH_KEY_DIRECTORY)
    const jwtIssuer = new JwtIssuer(keyPair, JWT_AUTH_ISSUER)

    Auth.singleton = new Auth(
      lnurlAuthLogin,
      jwtIssuer,
      accessTokenAudience,
    )
  }

  public static startup(server: Server) {
    SocketIoServer.init(server)
    /* eslint-disable-next-line no-console */
    console.info(' - Auth - WebSocket initialized')

    LnurlServer.init()
    /* eslint-disable-next-line no-console */
    console.info(' - Auth - LnurlServer initialized')
  }

  static getAuth(): Auth {
    if (Auth.singleton == null) {
      throw new Error('Auth getAuth called before init!')
    }

    return Auth.singleton
  }

  private static async loadKeyPairOrGenerateAndSaveKeyPairToDirectory(keyPairDirectory: string) {
    const jwtKeyPairHandler = new JwtKeyPairHandler(keyPairDirectory)
    let keyPair = await jwtKeyPairHandler.loadKeyPairFromDirectory()
    if (keyPair == null) {
      keyPair = await jwtKeyPairHandler.generateKeyPair()
      await jwtKeyPairHandler.saveKeyPairToDirectory(keyPair)
      /* eslint-disable-next-line no-console */
      console.info(` - Auth - Didn't find keys in directory (${keyPairDirectory}). Created new keys.`)
    }
    return keyPair
  }

  private static singleton: Auth

  private lnurlAuthLogin: LnurlAuthLogin
  private jwtIssuer: JwtIssuer
  private accessTokenAudience: string[] | string

  private constructor(lnurlAuthLogin: LnurlAuthLogin, jwtIssuer: JwtIssuer, accessTokenAudience: string[] | string) {
    this.lnurlAuthLogin = lnurlAuthLogin
    this.jwtIssuer = jwtIssuer
    this.accessTokenAudience = accessTokenAudience
  }

  public getLnurlAuthLogin(): LnurlAuthLogin {
    return this.lnurlAuthLogin
  }

  public getJwtIssuer(): JwtIssuer {
    return this.jwtIssuer
  }

  public getAccessTokenAudience(): string[] | string {
    return this.accessTokenAudience
  }
}
