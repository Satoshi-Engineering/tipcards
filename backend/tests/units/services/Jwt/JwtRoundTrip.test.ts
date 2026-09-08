import { afterEach, describe, expect, it } from 'vitest'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { errors } from 'jose'

import JwtIssuer from '../../../../../shared/src/modules/Jwt/JwtIssuer.js'
import JwtValidator from '../../../../../shared/src/modules/Jwt/JwtValidator.js'
import JwtKeyPairHandler from '../../../../../shared/src/modules/Jwt/JwtKeyPairHandler.js'

describe('JWT key persistence and verification', () => {
  let directory: string | undefined

  afterEach(() => {
    if (directory != null) {
      rmSync(directory, { recursive: true, force: true })
    }
  })

  it('persists keys and verifies tokens with the reloaded public key', async () => {
    directory = mkdtempSync(join(tmpdir(), 'tipcards-jwt-'))
    const handler = new JwtKeyPairHandler(directory)
    const generatedKeys = await handler.generateKeyPair()
    const originalIssuer = new JwtIssuer(generatedKeys, 'tipcards')
    const originalToken = await originalIssuer.createJwt('frontend', '1h', { sub: 'user-1' })

    await handler.saveKeyPairToDirectory(generatedKeys)
    const loadedKeys = await handler.loadKeyPairFromDirectory()
    expect(loadedKeys).not.toBeNull()
    if (loadedKeys == null) {
      throw new Error('Persisted JWT keys were not loaded')
    }
    await handler.saveKeyPairToDirectory(loadedKeys)

    const issuer = new JwtIssuer(loadedKeys, 'tipcards')
    const publicKey = await JwtKeyPairHandler.convertPublicKeyToCryptoKey({
      publicKeyAsString: await issuer.getPublicKeyAsSPKI(),
    })
    const validator = new JwtValidator(publicKey, 'tipcards')
    await expect(validator.validate(originalToken, 'frontend')).resolves.toMatchObject({ sub: 'user-1' })

    const token = await issuer.createJwt('frontend', '1h', { sub: 'user-2' })
    await expect(validator.validate(token, 'frontend')).resolves.toMatchObject({ sub: 'user-2' })
    await expect(validator.validate(token, 'other-audience')).rejects.toThrow(errors.JWTClaimValidationFailed)
    await expect(new JwtValidator(publicKey, 'other-issuer').validate(token, 'frontend'))
      .rejects.toThrow(errors.JWTClaimValidationFailed)

    const expiredToken = await issuer.createJwt('frontend', '-1h', { sub: 'user-2' })
    await expect(validator.validate(expiredToken, 'frontend')).rejects.toThrow(errors.JWTExpired)

    const unrelatedKeys = await handler.generateKeyPair()
    await expect(new JwtValidator(unrelatedKeys.publicKey, 'tipcards').validate(token, 'frontend'))
      .rejects.toThrow(errors.JWSSignatureVerificationFailed)
  })
})
