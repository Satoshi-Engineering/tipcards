import HDWallet from '../../shared/src/modules/HDWallet/HDWallet'

export const createRandomKeyPair = () => {
  const randomMnemonic = HDWallet.generateRandomMnemonic()
  const hdWallet = new HDWallet(randomMnemonic)
  const signingKey = hdWallet.getNodeAtPath(0, 0, 0)

  return {
    publicKeyAsHex: signingKey.getPublicKeyAsHex(),
    privateKeyAsHex: signingKey.getPrivateKeyAsHex(),
  }
}
