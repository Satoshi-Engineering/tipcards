import JwtIssuer from '../../shared/src/modules/Jwt/JwtIssuer'
import JwtKeyPairHandler from '../../shared/src/modules/Jwt/JwtKeyPairHandler'

let jwtIssuer: JwtIssuer

export const getJwtIssuer = async () => {
  if (jwtIssuer) {
    return jwtIssuer
  }
  const keyPairHandler = new JwtKeyPairHandler(process.env.JWT_AUTH_KEY_DIRECTORY)
  const keyPair = await keyPairHandler.loadKeyPairFromDirectory()
  return jwtIssuer = new JwtIssuer(keyPair, process.env.JWT_AUTH_ISSUER)
}

export const getJwtPayload = async ({ refreshToken }: { refreshToken: string }) => {
  const jwtIssuer = await getJwtIssuer()
  return await jwtIssuer.validate(refreshToken, process.env.JWT_AUTH_ISSUER)
}
