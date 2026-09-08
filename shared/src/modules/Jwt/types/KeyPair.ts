import {
  type CryptoKey,
} from 'jose'

export type KeyPair = {
  publicKey: CryptoKey
  privateKey: CryptoKey
}
