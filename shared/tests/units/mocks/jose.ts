import { vi } from 'vitest'

const jose = await vi.importActual('jose')

vi.mock('jose', () => ({
  importSPKI: vi.fn(),
  importPKCS8: vi.fn(),
  exportSPKI: vi.fn(),
  exportPKCS8: vi.fn(),
  generateKeyPair: vi.fn(),
  jwtVerify: vi.fn(),
  errors: jose.errors,
}))
