import { vi } from 'vitest'
import { EventEmitter } from 'events'

export class MockServer {
  public handlers: Record<string, (socketInstance?: MockSocket) => void> = {}

  public on(event: string, handler: (socketInstance?: MockSocket) => void) {
    this.handlers[event] = handler
  }

  public acceptConnection() {
    if (this.handlers && this.handlers['connection']) {
      const socketInstance = new Socket()
      this.handlers['connection'](socketInstance)
      return socketInstance
    }
  }
}

vi.mock('socket.io', () => {
  return {
    Server,
    Socket,
  }
})

const Server = vi.fn(() => {
  const server = new MockServer()
  return server
})

const Socket = vi.fn(() => {
  const socket = new MockSocket()
  vi.spyOn(socket, 'emit')
  return socket
})

export class MockSocket extends EventEmitter {
  public id = Math.random().toString(36).substring(2, 8)
}
