import { vi } from 'vitest'

import { LoginEvent } from '@auth/types/LoginEvent.js'

export class LnurlServerMock {
  private handlers: Record<string, (event: LoginEvent) => void> = {}

  public on(event: string, handler: (event: LoginEvent) => void) {
    this.handlers[event] = handler
  }

  public sendLoginEvent(event: LoginEvent) {
    if (this.handlers && this.handlers['login']) {
      this.handlers['login'](event)
    }
  }

  generateNewUrl = vi.fn()
}

vi.mock('lnurl', () => {
  return {
    default: {
      createServer: vi.fn(() => new LnurlServerMock()),
    },
  }
})
