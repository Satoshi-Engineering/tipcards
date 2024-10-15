import { Server, Socket } from 'socket.io'

export default class LoginInformer {
  private socketServer: Server

  private socketsByHash: Record<string, Socket> = {}
  private hashesBySocketId: Record<string, string> = {}
  private loginHashes: string[] = []

  constructor(socketServer: Server) {
    this.socketServer = socketServer
    this.initSocketEvents()
  }

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

  private initSocketEvents() {
    this.socketServer.on('connection', (socket) => {
      socket.on('waitForLogin', async ({ hash }) => {
        this.socketsByHash[hash] = socket
        this.hashesBySocketId[socket.id] = hash
        if (!this.loginHashExists(hash)) {
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

  private loginHashExists(hash: string) {
    return this.loginHashes.includes(hash)
  }
}
