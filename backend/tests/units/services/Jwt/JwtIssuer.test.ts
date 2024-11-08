import { describe, it, expect, vi } from 'vitest'

import { setSignedValue } from '../../mocks/jose.js'
import * as jose from 'jose'

import JwtIssuer from '../../../../../shared/src/modules/Jwt/JwtIssuer.js'
import { Algorithms } from '../../../../../shared/src/modules/Jwt/types/Algorithms.js'
import { KeyPair } from '../../../../../shared/src/modules/Jwt/types/KeyPair.js'

describe('JwtIssuer', () => {
  const mockPublicKey = 'mockPublicKey'
  const mockPrivateKey = 'mockPrivateKey'
  const mockSpkiPublicKey = 'mockSpkiPublicKey'
  const mockIssuer = 'mockIssuer'
  const mockSignedJwt = 'mockSignedJwt'
  const mockAlgorithm = Algorithms.RS256
  const mockKeyPair: KeyPair = {
    publicKey: mockPublicKey as unknown as jose.KeyLike,
    privateKey: mockPrivateKey as unknown as jose.KeyLike,
  }

  const jwtIssuer = new JwtIssuer(mockKeyPair, mockIssuer, mockAlgorithm)

  it('should create a JWT with the correct parameters', async () => {
    const mockAudience = 'mockAudience'
    const mockExpirationTime = '1h'
    const mockPayload = { sub: '1234567890', name: 'John Doe', admin: true }
    setSignedValue(mockSignedJwt)

    const result = await jwtIssuer.createJwt(mockAudience, mockExpirationTime, mockPayload)

    expect(result).toBe(mockSignedJwt)
  })

  it('should return the public key in SPKI format', async () => {
    vi.spyOn(jose, 'exportSPKI').mockResolvedValueOnce(mockSpkiPublicKey)

    const result = await jwtIssuer.getPublicKeyAsSPKI()

    expect(jose.exportSPKI).toHaveBeenCalledWith(mockPublicKey)
    expect(result).toBe('mockSpkiPublicKey')
  })
})
