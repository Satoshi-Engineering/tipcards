import { vi } from 'vitest'

vi.mock('@backend/services/jwt.js', () => {
  return {
    validateJwt: vi.fn(),
    createRefreshToken: vi.fn(),
    createAccessToken: vi.fn(),
  }
})
