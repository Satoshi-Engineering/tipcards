import {
  type JWTPayload,
  type KeyLike, SignJWT,
  exportSPKI,
} from 'jose'

import { type KeyPair } from './types/KeyPair.js'
import { Algorithms } from './types/Algorithms.js'
import JwtValidator from './JwtValidator.js'

export default class JwtIssuer extends JwtValidator{
  private privateKey: KeyLike
  private algorithm: Algorithms

  constructor(
    keyPair: KeyPair,
    issuer: string,
    algorithm: Algorithms = Algorithms.RS256,
  ) {
    super(keyPair.publicKey, issuer)
    this.privateKey = keyPair.privateKey
    this.algorithm = algorithm
  }

  createJwt(audience: string | string[], expirationTime: number | string | Date, payload: JWTPayload) {
    return new SignJWT(payload)
      .setProtectedHeader({ alg: this.algorithm })
      .setIssuedAt()
      .setIssuer(this.issuer)
      .setAudience(audience)
      .setExpirationTime(expirationTime)
      .sign(this.privateKey)
  }

  public async getPublicKeyAsSPKI() {
    return await exportSPKI(this.publicKey)
  }
}
