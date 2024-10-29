import JwtIssuer from '@backend/services/Jwt/JwtIssuer.js'
import JwtKeyPairHandler from '@backend/services/Jwt/JwtKeyPairHandler.js'
import { JWT_AUTH_ISSUER } from '@backend/constants.js'

import LnurlAuthLogin from '@auth/domain/LnurlAuthLogin.js'
import LoginInformer from '@auth/domain/LoginInformer.js'
import LnurlServer from '@auth/services/LnurlServer.js'
import { JWT_AUTH_KEY_DIRECTORY } from '@auth/constants.js'

export default class Auth {
  public static async init(accessTokenAudience: string[] | string) {
    if (Auth.singleton != null) {
      throw new Error('Auth already initialized!')
    }

    LnurlServer.init()
    /* eslint-disable-next-line no-console */
    console.info(' - Auth - LnurlServer initialized')

    const lnurlAuthLogin = new LnurlAuthLogin(
      LnurlServer.getServer(),
      new LoginInformer(),
    )

    const keyPair = await Auth.loadKeyPairOrGenerateAndSaveKeyPairToDirectory(JWT_AUTH_KEY_DIRECTORY)
    const jwtIssuer = new JwtIssuer(keyPair, JWT_AUTH_ISSUER)

    Auth.singleton = new Auth(
      lnurlAuthLogin,
      jwtIssuer,
      accessTokenAudience,
    )
  }

  public static get instance(): Auth {
    return Auth.getAuth()
  }

  public static getAuth(): Auth {
    if (Auth.singleton == null) {
      throw new Error('Auth getAuth called before init!')
    }

    return Auth.singleton
  }

  public get lnurlAuthLogin(): LnurlAuthLogin {
    return this.getLnurlAuthLogin()
  }

  public getLnurlAuthLogin(): LnurlAuthLogin {
    return this.lnurlAuthLoginInternal
  }

  public get jwtIssuer(): JwtIssuer {
    return this.getJwtIssuer()
  }

  public getJwtIssuer(): JwtIssuer {
    return this.jwtIssuerInternal
  }

  public get accessTokenAudience(): string[] | string {
    return this.getAccessTokenAudience()
  }

  public getAccessTokenAudience(): string[] | string {
    return this.accessTokenAudienceInternal
  }

  private static singleton: Auth

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

  private lnurlAuthLoginInternal: LnurlAuthLogin
  private jwtIssuerInternal: JwtIssuer
  private accessTokenAudienceInternal: string[] | string

  private constructor(lnurlAuthLogin: LnurlAuthLogin, jwtIssuer: JwtIssuer, accessTokenAudience: string[] | string) {
    this.lnurlAuthLoginInternal = lnurlAuthLogin
    this.jwtIssuerInternal = jwtIssuer
    this.accessTokenAudienceInternal = accessTokenAudience
  }
}
