import { vi } from 'vitest'

const jose = await vi.importActual('jose')

let signedReturnValue = ''
export const setSignedValue = (value: string) => {
  signedReturnValue = value
}

export const SignJWT = vi.fn(() => ({
  setProtectedHeader: vi.fn().mockReturnThis(),
  setIssuedAt: vi.fn().mockReturnThis(),
  setIssuer: vi.fn().mockReturnThis(),
  setAudience: vi.fn().mockReturnThis(),
  setExpirationTime: vi.fn().mockReturnThis(),
  sign: vi.fn().mockResolvedValue(signedReturnValue),
}))

vi.mock('jose', () => ({
  importSPKI: vi.fn(),
  importPKCS8: vi.fn(),
  exportSPKI: vi.fn(),
  exportPKCS8: vi.fn(),
  generateKeyPair: vi.fn(),
  jwtVerify: vi.fn(),
  SignJWT,
  errors: jose.errors,
}))
