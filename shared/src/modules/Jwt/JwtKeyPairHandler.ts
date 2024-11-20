import fs from 'fs'
import path from 'path'
import {
  importSPKI, importPKCS8,
  exportSPKI, exportPKCS8,
  generateKeyPair,
} from 'jose'

import { type KeyPair } from './types/KeyPair.js'
import { Algorithms } from './types/Algorithms.js'

const DEFAULT_PUBLIC_KEY_FILENAME = 'lnurl.auth.pem.pub'
const DEFAULT_PRIVATE_KEY_FILENAME = 'lnurl.auth.pem'

export default class JwtKeyPairHandler {
  private keyPairDirectory: string

  constructor(keyPairDirectory: string) {
    this.keyPairDirectory = keyPairDirectory
  }

  static async convertPublicKeyToKeyLike({
    publicKeyAsString,
    algorithm = Algorithms.RS256,
  }: {
    publicKeyAsString: string,
    algorithm?: Algorithms,
  }) {
    return await importSPKI(publicKeyAsString, algorithm)
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
      const publicKey = await JwtKeyPairHandler.convertPublicKeyToKeyLike({
        publicKeyAsString: data,
        algorithm,
      })
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
