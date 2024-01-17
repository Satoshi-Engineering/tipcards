/* eslint-disable no-console */
import 'dotenv/config'
import type { Socket } from 'net'
import type http from 'http'

import app from './src/app'
import { initSocketIo } from './src/api/auth'
import { EXPRESS_PORT } from './src/constants'
import consoleOverride from './src/consoleOverride'
import { initDatabase, closeDatabaseConnections } from '@backend/database'
import { loadCoarsWhitelist } from '@backend/services/corsOptions'
import { initAllWorkers } from '@backend/worker'
import { delay } from '@backend/services/timingUtils'

consoleOverride()

const APP_NAME = 'Node Backend'

const EXIT_CODE_PREMATURE_DATABASE_CLOSE = 129

let shutDownStarted = false

const shutDown = async (server: http.Server, connections: Array<Socket>, exitCode = 0) => {
  shutDownStarted = true

  // Timeout for forceclosing the connections
  setTimeout(() => {
    console.error('Could not close connections in time, forcefully shutting down')
    process.exit(1)
  }, 10000).unref()

  // Http
  console.info('Closing http server')
  await new Promise((resolve) => {
    server.close(() => resolve(true))
  })
  console.info(' - Closed')

  // Socket
  console.info('Closing all socket connections')
  await Promise.all(connections.map((connection) => new Promise((resolve) => {
    setTimeout(() => connection.destroy(), 5000)
    connection.end(() => resolve(true))
  })))
  console.info(' - Closed')

  // make sure all calls are really done
  await delay(500)

  // Closing DB Connections
  console.info('Closing database connections')
  await closeDatabaseConnections()
  console.info(' - Closed')

  process.exit(exitCode)
}

const startup = async () => {
  const onDatabaseConnectionEnded = () => {
    if (shutDownStarted) {
      return
    }
    console.error(`Database connection ended without application shutdown! Shutting down application with exit code ${EXIT_CODE_PREMATURE_DATABASE_CLOSE}!`)
    shutDown(server, connections, EXIT_CODE_PREMATURE_DATABASE_CLOSE)
  }

  await initDatabase(onDatabaseConnectionEnded)
  await loadCoarsWhitelist()
  initAllWorkers()

  const server = app.listen(EXPRESS_PORT, async () => {
    console.info(`${APP_NAME} running on ${EXPRESS_PORT}`)
  })

  initSocketIo(server)

  let connections: Array<Socket> = []

  server.on('connection', (connection: Socket) => {
    connections.push(connection)
    connection.on('close', () => connections = connections.filter(curr => curr !== connection))
  })

  process.on('SIGTERM', () => {
    console.info(`SIGTERM signal received: Shutting down ${APP_NAME} ...`)
    shutDown(server, connections)
  })

  process.on('SIGINT', () => {
    console.info(`SIGINT signal received: Shutting down ${APP_NAME} ...`)
    shutDown(server, connections)
  })
}

process.on('uncaughtException', async (error, origin) => {
  console.error('uncaughtException', error, origin)
  process.exit(1)
})

process.on('unhandledRejection', async (reason, promise) => {
  console.error('unhandledRejection', reason, promise)
  process.exit(1)
})

startup()
