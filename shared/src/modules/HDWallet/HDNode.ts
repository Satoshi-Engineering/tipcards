import crypto from 'crypto'
import * as bip32 from 'bip32'

export default class HDNode {
  sign(messageAsHex: string, outputFormat: 'hex' | 'base64') {
    const message = Uint8Array.from(Buffer.from(messageAsHex, 'hex'))
    return Buffer.from(this.node.sign(message)).toString(outputFormat)
  }

  verify(message: string, signature: string) {
    const messageBuffer = Buffer.from(message)
    const hash = Uint8Array.from(crypto.createHash('sha256').update(messageBuffer).digest())
    const signatureBytes = Uint8Array.from(Buffer.from(signature, 'base64'))
    return this.node.verify(hash, signatureBytes)
  }

  private node

  constructor(node: bip32.BIP32Interface) {
    this.node = node
  }

  getPrivateKeyAsBytes(): Buffer {
    if (this.node.privateKey == null) {
      throw new Error('getPrivateKeyAsBytes() where privateKey == null --> Not Implemented')
    }
    return Buffer.from(this.node.privateKey)
  }

  getPrivateKeyAsHex() {
    return this.getPrivateKeyAsBytes().toString('hex')
  }

  getPrivateKeyAsWIF() {
    return this.node.toWIF()
  }

  getPublicKeyAsBytes(): Buffer {
    return Buffer.from(this.node.publicKey)
  }

  getPublicKeyAsHex() {
    return this.getPublicKeyAsBytes().toString('hex')
  }
}
