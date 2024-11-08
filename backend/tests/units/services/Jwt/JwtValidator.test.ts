import { describe, it, expect, vi } from 'vitest'

import '../../mocks/jose.js'
import * as jose from 'jose'

import JwtValidator from '../../../../../shared/src/modules/Jwt/JwtValidator.js'

describe('JwtValidator', () => {
  const mockPublicKey = 'mockPublicKey' as unknown as jose.KeyLike
  const mockIssuer = 'mockIssuer'
  const mockAudience = 'mockAudience'
  const mockJwt = 'mockJwt'

  const jwtValidator = new JwtValidator(mockPublicKey, mockIssuer)

  it('should throw JWTExpired error when payload.exp is null', async () => {
    vi.spyOn(jose, 'jwtVerify').mockResolvedValueOnce({
      payload: {
        exp: undefined,
      },
      protectedHeader: { alg: 'RS256', typ: 'JWT' },
      key: {
        type: '',
      },
    })

    await expect(jwtValidator.validate(mockJwt, mockAudience)).rejects.toThrow(jose.errors.JWTExpired)
    expect(jose.jwtVerify).toBeCalledWith(mockJwt, mockPublicKey, { issuer: mockIssuer, audience: mockAudience })
  })

  it('should throw JWTExpired error when payload.exp * 1000 is less than the current date', async () => {
    const pastDateInSeconds = Math.floor(Date.now() / 1000) - 1000

    vi.spyOn(jose, 'jwtVerify').mockResolvedValueOnce({
      payload: {
        exp: pastDateInSeconds,
      },
      protectedHeader: { alg: 'RS256', typ: 'JWT' },
      key: {
        type: '',
      },
    })

    await expect(jwtValidator.validate(mockJwt, mockAudience)).rejects.toThrow(jose.errors.JWTExpired)
    expect(jose.jwtVerify).toBeCalledWith(mockJwt, mockPublicKey, { issuer: mockIssuer, audience: mockAudience })
  })

  it('should validate successfully when payload.exp is valid', async () => {
    const futureDateInSeconds = Math.floor(Date.now() / 1000) + 1000
    const mockPayload = {
      exp: futureDateInSeconds,
      test: 'test',
      extraPayload: 'extraPayload',
    }

    vi.spyOn(jose, 'jwtVerify').mockResolvedValueOnce({
      payload: mockPayload,
      protectedHeader: { alg: 'RS256', typ: 'JWT' },
      key: {
        type: '',
      },
    })

    const result = await jwtValidator.validate(mockJwt, mockAudience)
    expect(result).toEqual(expect.objectContaining(mockPayload))
  })
})
