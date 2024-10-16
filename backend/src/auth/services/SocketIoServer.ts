import { Server } from 'socket.io'
import type http from 'http'

import corsOptions from '@backend/services/corsOptions.js'
import {
  LNURL_AUTH_DEBUG,
} from '@auth/constants.js'

export default class SocketIoServer {
  static init(server: http.Server) {
    if (SocketIoServer.singleton != null) {
      throw new Error('SocketIoServer already started!')
    }

    SocketIoServer.singleton = new SocketIoServer(server)
  }

  static getServer(): Server {
    if (SocketIoServer.singleton == null) {
      throw new Error('SocketIoServer getConnector called before init!')
    }

    return SocketIoServer.singleton.server
  }

  private static singleton: SocketIoServer
  private server: Server

  private constructor(server: http.Server) {
    this.server = new Server(server, {
      cors: LNURL_AUTH_DEBUG ? { origin: '*' } : corsOptions,
    })
  }
}
