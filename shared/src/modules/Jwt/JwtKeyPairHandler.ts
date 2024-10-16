import fs from 'fs'
import path from 'path'
import {
  importSPKI, importPKCS8,
  exportSPKI, exportPKCS8,
  generateKeyPair,
  type KeyLike,
} from 'jose'

const DEFAULT_PUBLIC_KEY_FILENAME = 'lnurl.auth.pem.pub'
const DEFAULT_PRIVATE_KEY_FILENAME = 'lnurl.auth.pem'

export enum Algorithms {
  RS256 = 'RS256',
}

export type KeyPair = {
  publicKey: KeyLike
  privateKey: KeyLike
}

export default class JwtKeyPairHandler {
  private keyPairDirectory: string

  constructor(keyPairDirectory: string) {
    this.keyPairDirectory = keyPairDirectory
  }

  async loadKeyPairFromDirectory(
    filenamePublicKey: string = DEFAULT_PUBLIC_KEY_FILENAME,
    filenamePrivateKey: string = DEFAULT_PRIVATE_KEY_FILENAME,
    algorithm: Algorithms = Algorithms.RS256,
  ) {
    const filenamePublicKeyResolved = path.resolve(this.keyPairDirectory, filenamePublicKey)
    const filenamePrivateKeyResolved = path.resolve(this.keyPairDirectory, filenamePrivateKey)

    if (fs.existsSync(filenamePublicKeyResolved) && fs.existsSync(filenamePrivateKeyResolved)) {
      let data = fs.readFileSync(filenamePublicKeyResolved, 'utf8')
      const publicKey = await importSPKI(data, algorithm)
      data = fs.readFileSync(filenamePrivateKeyResolved, 'utf8')
      const privateKey = await importPKCS8(data, algorithm)

      return { publicKey, privateKey }
    }

    return null
  }

  async saveKeyPairToDirectory(
    { publicKey, privateKey }: KeyPair,
    filenamePublicKey: string = DEFAULT_PUBLIC_KEY_FILENAME,
    filenamePrivateKey: string = DEFAULT_PRIVATE_KEY_FILENAME,
  ) {
    const filenamePublicKeyResolved = path.resolve(this.keyPairDirectory, filenamePublicKey)
    const filenamePrivateKeyResolved = path.resolve(this.keyPairDirectory, filenamePrivateKey)

    const spkiPem = await exportSPKI(publicKey)
    fs.writeFileSync(filenamePublicKeyResolved, spkiPem)
    const pkcs8Pem = await exportPKCS8(privateKey)
    fs.writeFileSync(filenamePrivateKeyResolved, pkcs8Pem)
  }

  async generateKeyPair(algorithm: Algorithms = Algorithms.RS256) {
    return await generateKeyPair(algorithm)
  }
}
