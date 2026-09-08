import {
  type CryptoKey, jwtVerify,
  errors,
} from 'jose'

export default class JwtValidator {
  protected publicKey: CryptoKey
  protected issuer: string

  /**
   * @throws jose errors
   */
  async validate(jwt: string, audience: string) {
    const { payload } = await jwtVerify(jwt, this.publicKey, {
      issuer: this.issuer,
      audience,
    })
    if (payload.exp == null || payload.exp * 1000 < + new Date()) {
      throw new errors.JWTExpired('Authorization expired.', payload)
    }
    return payload
  }

  constructor(
    publicKey: CryptoKey,
    issuer: string,
  ) {
    this.publicKey = publicKey
    this.issuer = issuer
  }
}
