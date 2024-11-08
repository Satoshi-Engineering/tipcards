import {
  type KeyLike,
} from 'jose'

export type KeyPair = {
  publicKey: KeyLike
  privateKey: KeyLike
}
