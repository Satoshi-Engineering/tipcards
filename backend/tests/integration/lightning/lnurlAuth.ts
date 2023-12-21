// https://github.com/lnurl/luds/blob/luds/04.md
import * as secp256k1 from 'secp256k1'

export const sign = (messageAsHex: string, privateKeyAsHex: string) => {
  const messageAsBuffer = Buffer.from(messageAsHex, 'hex')
  const privateKeyAsBuffer = Buffer.from(privateKeyAsHex, 'hex')
  const { signature } = secp256k1.ecdsaSign(messageAsBuffer, privateKeyAsBuffer)
  const derEncodedSignature = secp256k1.signatureExport(signature)
  return Buffer.from(derEncodedSignature).toString('hex')
}
