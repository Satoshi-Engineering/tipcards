/* eslint-disable no-console */
import type { Server } from 'http'
import type { Socket } from 'net'

import Database from '@backend/database/Database.js'
import { APP_NAME } from '@backend/constants.js'

export const shutdown = async (server: Server, connections: Socket[], exitCode = 0) => {
  forceExitInTenSeconds()

  await shutdownHttpServer(server)

  await closeAllSocketConnections(connections)

  await closeDatabaseConnections()

  process.exit(exitCode)
}

const forceExitInTenSeconds = () => {
  setTimeout(() => {
    console.error(`${APP_NAME} could not close connections in time, forcefully shutting down`)
    process.exit(1)
  }, 10000).unref()
}

const shutdownHttpServer = async (server: Server) => {
  console.info('Closing http server')
  await new Promise((resolve) => {
    server.close(() => resolve(true))
  })
  console.info(' - Closed')
}

const closeAllSocketConnections = async (connections: Socket[]) => {
  console.info('Closing all socket connections')
  await Promise.all(connections.map((connection) => new Promise((resolve) => {
    forceCloseConnectionInFiveSeconds(connection, resolve)
    connection.end(() => resolve(true))
  })))
  console.info(' - Closed')
}

const forceCloseConnectionInFiveSeconds = (connection: Socket, resolve: (value: unknown) => void) => {
  setTimeout(() => {
    connection.destroy()
    resolve(true)
  }, 5000).unref()
}

const closeDatabaseConnections = async () => {
  console.info('Closing database connections')
  await Database.closeConnectionIfExists()
  console.info(' - Closed')
}
