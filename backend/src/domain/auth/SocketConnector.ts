import { Server, Socket } from 'socket.io'
import type http from 'http'

import corsOptions from '@backend/services/corsOptions.js'
import {
  LNURL_AUTH_DEBUG,
} from '@backend/constants.js'

export default class SocketConnector {
  static init(server: http.Server) {
    if (SocketConnector.singleton != null) {
      throw new Error('SocketConnector already started!')
    }

    SocketConnector.singleton = new SocketConnector()
    SocketConnector.singleton.init(server)
  }

  static getConnector(): SocketConnector {
    if (SocketConnector.singleton == null) {
      throw new Error('SocketConnector getConnector called before startup!')
    }

    return SocketConnector.singleton
  }

  private static singleton: SocketConnector

  private socketsByHash: Record<string, Socket> = {}
  private hashesBySocketId: Record<string, string> = {}
  private loginHashes: string[] = []

  public emitLoginSuccessfull(hash: string) {
    if (this.socketsByHash[hash] == null) {
      return
    }

    this.socketsByHash[hash].emit('loggedIn')
  }

  public addLoginHash(hash: string) {
    this.loginHashes.push(hash)
  }

  public removeLoginHash(hash: string) {
    const indexToRemove = this.loginHashes.indexOf(hash)
    if (indexToRemove !== -1) {
      this.loginHashes.splice(indexToRemove, 1)
    }
  }

  private loginHashExists(hash: string) {
    return this.loginHashes.includes(hash)
  }

  private init(server: http.Server) {
    const io = new Server(server, {
      cors: LNURL_AUTH_DEBUG ? { origin: '*' } : corsOptions,
    })

    io.on('connection', (socket) => {
      socket.on('waitForLogin', async ({ hash }) => {
        this.socketsByHash[hash] = socket
        this.hashesBySocketId[socket.id] = hash
        if (this.loginHashExists(hash)) {
          return
        }
        this.socketsByHash[hash].emit('loggedIn')
      })

      socket.on('disconnect', () => {
        if (this.hashesBySocketId[socket.id] == null) {
          return
        }
        const hash = this.hashesBySocketId[socket.id]
        delete this.socketsByHash[hash]
        delete this.hashesBySocketId[socket.id]
      })
    })
  }
}
