import crypto from 'crypto'
import * as bip32 from 'bip32'

export default class HDNode {
  sign(messageAsHex: string, outputFormat: 'hex' | 'base64') {
    const messageAsBuffer = Buffer.from(messageAsHex, 'hex')
    return this.node.sign(messageAsBuffer).toString(outputFormat)
  }

  verify(message: string, signature: string) {
    const messageBuffer = Buffer.from(message)
    const hash = crypto.createHash('sha256').update(messageBuffer).digest()
    const signatureBuffer = Buffer.from(signature, 'base64')
    return this.node.verify(hash, signatureBuffer)
  }

  private node

  constructor(node: bip32.BIP32Interface) {
    this.node = node
  }

  getPrivateKeyAsBytes(): Buffer {
    if (this.node.privateKey == null) {
      throw new Error('getPrivateKeyAsBytes() where privateKey == null --> Not Implemented')
    }
    return this.node.privateKey
  }

  getPrivateKeyAsHex() {
    return this.getPrivateKeyAsBytes().toString('hex')
  }

  getPrivateKeyAsWIF() {
    return this.node.toWIF()
  }

  getPublicKeyAsBytes() {
    return this.node.publicKey
  }

  getPublicKeyAsHex() {
    return this.node.publicKey.toString('hex')
  }
}
