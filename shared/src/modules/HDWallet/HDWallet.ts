import { randomBytes } from 'crypto'
import * as bip39 from 'bip39'
import * as bip32 from 'bip32'
import * as base58 from 'bs58'
import * as ecc from 'tiny-secp256k1'

import HDNode from './HDNode.js'

const DEFAUT_HD_PATH = 'm/84\'/0\''

const bip32api = bip32.BIP32Factory(ecc)

export default class HDWallet {
  static generateRandomMnemonic() {
    const entropy = randomBytes(32)
    if (entropy.length !== 32) { throw Error('Entropy has incorrect length') }
    return bip39.entropyToMnemonic(entropy.toString('hex'))
  }

  static generateRandomNode() {
    const randomMnemonic = HDWallet.generateRandomMnemonic()
    const hdWallet = new HDWallet(randomMnemonic)
    return hdWallet.getNodeAtPath(0, 0, 0)
  }

  static deriveBip32Node(mnemonic: string) {
    bip39.validateMnemonic(mnemonic)

    const bip39Seed = bip39.mnemonicToSeedSync(mnemonic)
    return bip32api.fromSeed(bip39Seed)
  }

  static deriveNodeAtPath(node: bip32.BIP32Interface, hdPath: string) {
    const derivedNode = node.derivePath(hdPath)

    return {
      derivedNode,
      privateKey: derivedNode.toWIF(),
      publicKey: derivedNode.publicKey,
    }
  }

  static prvToPrv(xyzprv: string,  outputPub: 'xprv'| 'yprv' | 'zprv' = 'xprv') {
    if (!['xprv', 'yprv', 'zprv'].includes(xyzprv.slice(0, 4))) {
      throw new Error('Invalid argument. Provided Public Key is neither a valid xpub, ypub nor zpub.')
    }

    let bytes = null
    if (outputPub === 'xprv') { bytes = '0488ade4' }
    if (outputPub === 'yprv') { bytes = '049d7878' }
    if (outputPub === 'zprv') { bytes = '04b2430c' }
    if (bytes === null) { throw new Error('Invalid argument output. Provide with xprv, yprv or zprv.') }

    let data = base58.decode(xyzprv).slice(4)
    data = Buffer.concat([Buffer.from(bytes,'hex'), data])
    return base58.encode(data)
  }

  static pubToPub(xyzpub: string, outputPub: 'xpub' | 'ypub' | 'zpub' = 'xpub') {
    if (!['xpub', 'ypub', 'zpub'].includes(xyzpub.slice(0, 4))) {
      throw new Error('Invalid argument. Provided Public Key is neither a valid xpub, ypub nor zpub.')
    }

    let bytes = null
    if (outputPub === 'xpub') { bytes = '0488b21e' }
    if (outputPub === 'ypub') { bytes = '049d7cb2' }
    if (outputPub === 'zpub') { bytes = '04b24746' }
    if (bytes === null) { throw new Error('Invalid argument output. Provide with xpub, ypub or zpub.') }

    let data = base58.decode(xyzpub).slice(4)
    data = Buffer.concat([Buffer.from(bytes,'hex'), data])
    return base58.encode(data)
  }

  private bip32Node
  private mnemonic

  constructor(mnemonic = '') {
    if (mnemonic === '') {
      this.mnemonic = HDWallet.generateRandomMnemonic()
      console.warn('HDWallet: generating HD Wallet with crypto.randomBytes!')
    } else {
      this.mnemonic = mnemonic
    }

    this.bip32Node = HDWallet.deriveBip32Node(this.mnemonic)
  }

  getNodeAtPath(account: number, change: number, index: number) {
    const { derivedNode } = HDWallet.deriveNodeAtPath(this.bip32Node, `${DEFAUT_HD_PATH}/${account}'/${change}/${index}`)
    return new HDNode(derivedNode)
  }
}
