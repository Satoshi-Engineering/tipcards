import { vi } from 'vitest'

vi.mock('jose', () => ({
  importSPKI: vi.fn(),
  importPKCS8: vi.fn(),
  exportSPKI: vi.fn(),
  exportPKCS8: vi.fn(),
  generateKeyPair: vi.fn(),
}))
