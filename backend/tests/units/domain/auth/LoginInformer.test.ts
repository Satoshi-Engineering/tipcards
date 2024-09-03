import { describe, vi, it, expect, beforeEach } from 'vitest'

import '../../mocks/process.env.js'
import '../../mocks/socketIoServer.js' // This line has to be an extra statement, otherwise the vi.mock will not work!
import { MockServer, MockSocket } from '../../mocks/socketIoServer.js'

import { Server } from 'socket.io'

import LoginInformer from '@backend/domain/auth/LoginInformer.js'

describe('LoginInformer', () => {
  const socketServer = new Server()
  const mockServer = socketServer as unknown as MockServer

  const acceptConnection = (): MockSocket => {
    return mockServer.acceptConnection() as MockSocket
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should add socketByHash and hashesBySocket after waitForLogin event', () => {
    const hash = 'hash01'
    const loginInformer = new LoginInformer(socketServer)
    const mockSocket = acceptConnection()
    mockSocket.emit('waitForLogin', { hash })
    expect(loginInformer['socketsByHash'][hash]).toBe(mockSocket)
    expect(loginInformer['hashesBySocketId'][mockSocket.id]).toBe(hash)
  })

  it('should remove socketByHash and hashesBySocket after disconnect event', () => {
    const hash = 'hash01'

    const loginInformer = new LoginInformer(socketServer)
    const mockSocket = acceptConnection()
    mockSocket.emit('waitForLogin', { hash })
    mockSocket.emit('disconnect')
    expect(loginInformer['socketsByHash'][hash]).not.toBe(mockSocket)
    expect(loginInformer['hashesBySocketId'][mockSocket.id]).not.toBe(hash)
  })

  it('should add login hash correctly', () => {
    const loginInformer = new LoginInformer(socketServer)
    loginInformer.addLoginHash('hash1')
    expect(loginInformer['loginHashes']).toContain('hash1')
  })

  it('should remove login hash correctly', () => {
    const loginInformer = new LoginInformer(socketServer)
    loginInformer.addLoginHash('hash1')
    loginInformer.removeLoginHash('hash1')
    expect(loginInformer['loginHashes']).not.toContain('hash1')
  })

  it('should emit loggedIn event after waitForLogin event, if loginHash exists', () => {
    const hash = 'hash01'
    const loginInformer = new LoginInformer(socketServer)
    loginInformer.addLoginHash(hash)

    const mockSocket = acceptConnection()
    mockSocket.emit('waitForLogin', { hash })
    expect(mockSocket.emit).toHaveBeenCalledWith('loggedIn')
  })

  it('should not emit loggedIn event after waitForLogin event', () => {
    const hash = 'hash01'
    new LoginInformer(socketServer)
    const mockSocket = acceptConnection()
    mockSocket.emit('waitForLogin', { hash })
    expect(mockSocket.emit).not.toHaveBeenCalledWith('loggedIn')
  })
})
