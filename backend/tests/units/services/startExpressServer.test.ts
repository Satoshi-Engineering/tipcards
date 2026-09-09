import express from 'express'
import { afterEach, describe, expect, it } from 'vitest'

import startExpressServer from '@backend/services/startExpressServer.js'

import type { Server } from 'http'

describe('startExpressServer', () => {
  let occupiedServer: Server | undefined

  afterEach(async () => {
    if (occupiedServer == null) {
      return
    }
    const server = occupiedServer
    occupiedServer = undefined
    await new Promise<void>((resolve, reject) => {
      server.close(error => error == null ? resolve() : reject(error))
    })
  })

  it('should reject when the port is already in use', async () => {
    occupiedServer = await startExpressServer(express(), 0)
    const address = occupiedServer.address()
    if (address == null || typeof address === 'string') {
      throw new Error('Expected the server to listen on a TCP port.')
    }

    await expect(startExpressServer(express(), address.port)).rejects.toMatchObject({
      code: 'EADDRINUSE',
    })
  })
})
