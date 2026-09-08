import crypto from 'node:crypto'

import { describe, expect, it } from 'vitest'

import HDWallet from '@shared/modules/HDWallet/HDWallet.js'

const mnemonic = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about'

describe('HDNode', () => {
  const node = new HDWallet(mnemonic).getNodeAtPath(0, 0, 0)

  it('preserves the derived key formats', () => {
    expect(node.getPrivateKeyAsBytes()).toBeInstanceOf(Buffer)
    expect(node.getPrivateKeyAsHex()).toBe('4604b4b710fe91f584fff084e1a9159fe4f8408fff380596a604948474ce4fa3')
    expect(node.getPublicKeyAsBytes()).toBeInstanceOf(Buffer)
    expect(node.getPublicKeyAsHex()).toBe('0330d54fd0dd420a6e5f8d3624f5f3482cae350f79d5f0753bf5beef9c2d91af3c')
  })

  it('preserves signature encoding and verification', () => {
    const message = 'tipcards'
    const messageHashAsHex = crypto.createHash('sha256').update(message).digest('hex')

    const signatureAsBase64 = node.sign(messageHashAsHex, 'base64')
    const signatureAsHex = node.sign(messageHashAsHex, 'hex')

    expect(Buffer.from(signatureAsBase64, 'base64')).toHaveLength(64)
    expect(Buffer.from(signatureAsHex, 'hex')).toHaveLength(64)
    expect(node.verify(message, signatureAsBase64)).toBe(true)
    expect(node.verify('another message', signatureAsBase64)).toBe(false)
  })
})
