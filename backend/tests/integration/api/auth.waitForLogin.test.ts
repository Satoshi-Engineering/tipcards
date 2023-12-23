import '../initEnv'

import { AxiosResponse } from 'axios'
import { io, Socket } from 'socket.io-client'

import { waitUntilWithStep } from '@backend/services/timingUtils'

import FailEarly from '../../FailEarly'
import FrontendSimulator from '../frontend/FrontendSimulator'
import LNURLAuth from '../lightning/LNURLAuth'
import HDWallet from '../lightning/HDWallet'

const failEarly = new FailEarly(it)

let socket: Socket | null = null
let socketError: Error | null = null
let socketLoggedInEventRecieved = false
const frontend = new FrontendSimulator()
const randomSigningKey = HDWallet.generateRandomNode()
const lnurlAuth = new LNURLAuth(randomSigningKey)

afterAll(() => {
  if (socket !== null) socket.close()
})

const initSocket = (socket: Socket) => {
  socket.on('error', (error) => {
    socketError = error
  })
  socket.on('loggedIn', async () => {
    socketLoggedInEventRecieved = true
  })
}

describe('auth wait for login (socket.io)', () => {
  failEarly.it('should connect to socket in 2 sec', async () => {
    socket = io(process.env.TEST_API_ORIGIN as string)
    if (socket === null) throw Error('socket should be an instance')

    initSocket(socket)

    await waitUntilWithStep(100, 20, () => {
      if (socket === null) throw Error('socket should be an instance')
      return socket.connected
    })

    expect(socket.connected).toBe(true)
    expect(socketError).toBe(null)
  })

  failEarly.it('should recieve loggedIn socket event in 2 sec, after login with lnurlauth', async () => {
    if (socket === null || !socket.connected) throw Error('socket should be an instance and connected')

    const response: AxiosResponse = await frontend.authCreate()
    expect(frontend.authServiceLoginHash).not.toBe('')

    socket.emit('waitForLogin', { hash: frontend.authServiceLoginHash })
    await lnurlAuth.loginWithLNURLAuth(response.data.data.encoded)

    await waitUntilWithStep(100, 20, () => socketLoggedInEventRecieved)

    expect(socketLoggedInEventRecieved).toBe(true)
  })
})
