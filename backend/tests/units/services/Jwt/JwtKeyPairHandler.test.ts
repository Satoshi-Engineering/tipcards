import { describe, it, expect, vi, beforeEach } from 'vitest'
import { vol } from 'memfs'
import path from 'path'

import '../../mocks/jose.js'
import * as jose from 'jose'

import JwtKeyPairHandler from '../../../../../shared/src/modules/Jwt/JwtKeyPairHandler.js'

vi.mock('fs')
vi.mock('fs', async () => {
  return await vi.importActual('memfs')
})

const mockKeyPair = {
  publicKey: { type: 'type' },
  privateKey: { type: 'type' },
}

const keyPairDirectory = '/some/directory'
const mockPublicKeyData = 'mockPublicKeyData'
const mockPrivateKeyData = 'mockPrivateKeyData'

beforeEach(() => {
  vol.fromJSON({
    'garbage.auth.pem.pub': 'garbage content',
    'lnurl.auth.pem.pub': mockPublicKeyData,
    'lnurl.auth.pem': mockPrivateKeyData,
  }, keyPairDirectory)
})

describe('JwtKeyPairHandler', () => {
  const jwtKeyPairHandler = new JwtKeyPairHandler(keyPairDirectory)

  describe('loadKeyPairFromDirectory', () => {
    it('should throw an exception when keys on disk are garbage', async () => {
      vi.spyOn(jose, 'importSPKI').mockRejectedValue(new TypeError('Invalid SPKI'))

      await expect(jwtKeyPairHandler.loadKeyPairFromDirectory('garbage.auth.pem.pub'))
        .rejects
        .toThrow(TypeError)
    })

    it('should load default keys when they exist', async () => {
      vi.spyOn(jose, 'importSPKI').mockResolvedValue(mockKeyPair.publicKey)
      vi.spyOn(jose, 'importPKCS8').mockResolvedValue(mockKeyPair.privateKey)

      const result = await jwtKeyPairHandler.loadKeyPairFromDirectory()
      expect(result).toEqual(mockKeyPair)
      expect(jose.importSPKI).toHaveBeenCalledWith(mockPublicKeyData, 'RS256')
      expect(jose.importPKCS8).toHaveBeenCalledWith(mockPrivateKeyData, 'RS256')
    })

    it('should return null if default keys don’t exist', async () => {
      const resultPublicKey = await jwtKeyPairHandler.loadKeyPairFromDirectory('file-does-not-exist.auth.pem.pub')
      expect(resultPublicKey).toBeNull()

      const resultPrivateKey = await jwtKeyPairHandler.loadKeyPairFromDirectory('lnurl.auth.pem.pub', 'file-does-not-exist.auth.pem.pub')
      expect(resultPrivateKey).toBeNull()
    })
  })

  describe('saveKeyPairToDirectory', () => {
    it('should save key pair to disk', async () => {
      const mockSPKI = 'mockSPKI'
      const mockPKCS8 = 'mockPKCS8'
      vi.spyOn(jose, 'exportSPKI').mockResolvedValue(mockSPKI)
      vi.spyOn(jose, 'exportPKCS8').mockResolvedValue(mockPKCS8)

      await jwtKeyPairHandler.saveKeyPairToDirectory(mockKeyPair)

      expect(jose.exportSPKI).toHaveBeenCalledWith(mockKeyPair.publicKey)
      expect(jose.exportPKCS8).toHaveBeenCalledWith(mockKeyPair.privateKey)

      const filenamePublicKeyResolved = path.resolve(keyPairDirectory, 'lnurl.auth.pem.pub')
      const filenamePrivateKeyResolved = path.resolve(keyPairDirectory, 'lnurl.auth.pem')

      expect(vol.readFileSync(filenamePublicKeyResolved, 'utf8')).toEqual(mockSPKI)
      expect(vol.readFileSync(filenamePrivateKeyResolved, 'utf8')).toEqual(mockPKCS8)
    })
  })

  describe('generateKeyPair', () => {
    it('should generate a new key pair', async () => {
      vi.spyOn(jose, 'generateKeyPair').mockResolvedValue(mockKeyPair)

      const result = await jwtKeyPairHandler.generateKeyPair()
      expect(result).toEqual(mockKeyPair)
      expect(jose.generateKeyPair).toHaveBeenCalledWith('RS256')
    })
  })
})
