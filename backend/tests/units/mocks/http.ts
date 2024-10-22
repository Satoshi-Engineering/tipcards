import { vi } from 'vitest'

vi.mock('http', () => {
  return {
    default: {
      Server,
    },
  }
})

const Server = vi.fn(() => ({
  on: vi.fn(),
  listen: vi.fn(),
  close: vi.fn(),
}))
