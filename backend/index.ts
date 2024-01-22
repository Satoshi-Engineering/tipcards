/* eslint-disable no-console */
import 'dotenv/config'
import type http from 'http'
import fs from 'fs'
import type { Socket } from 'net'
import path from 'path'

import app from './src/app'
import { initSocketIo } from './src/api/auth'
import { EXPRESS_PORT, FAILED_STARTUPS_COUNTER_DIRECTORY } from './src/constants'
import consoleOverride from './src/consoleOverride'
import { initDatabase, closeDatabaseConnections } from '@backend/database'
import { loadCoarsWhitelist } from '@backend/services/corsOptions'
import { initAllWorkers } from '@backend/worker'
import { delay } from '@backend/services/timingUtils'

consoleOverride()

const APP_NAME = 'Lightning Tip Cards Backend'

const EXIT_CODE_FAILED_STARTUP = 129
const EXIT_CODE_PREMATURE_DATABASE_CLOSE = 130

let shutDownStarted = false

const shutDown = async (server: http.Server, connections: Array<Socket>, exitCode = 0) => {
  shutDownStarted = true

  // Timeout for forceclosing the connections
  setTimeout(() => {
    console.error(`${APP_NAME} could not close connections in time, forcefully shutting down`)
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
  console.info(`${APP_NAME} starting`)

  const onDatabaseConnectionEnded = () => {
    if (shutDownStarted) {
      return
    }
    console.error(`${APP_NAME} database connection ended without application shutdown! Shutting down application with exit code ${EXIT_CODE_PREMATURE_DATABASE_CLOSE}!`)
    shutDown(server, connections, EXIT_CODE_PREMATURE_DATABASE_CLOSE)
  }

  await initDatabase(onDatabaseConnectionEnded)
  console.info(' - Database connected')

  await loadCoarsWhitelist()
  console.info(' - CORS whitelist loaded')

  initAllWorkers()
  console.info(' - cron workers initialized')

  const server = app.listen(EXPRESS_PORT, async () => {
    console.info(` - app running and listening on port ${EXPRESS_PORT}`)
  })

  initSocketIo(server)
  console.info(' - WebSocket initialized')

  let connections: Array<Socket> = []

  server.on('connection', (connection: Socket) => {
    connections.push(connection)
    connection.on('close', () => connections = connections.filter(curr => curr !== connection))
  })

  process.on('SIGTERM', () => {
    console.info(`${APP_NAME} SIGTERM signal received. Shutting down ...`)
    shutDown(server, connections)
  })

  process.on('SIGINT', () => {
    console.info(`${APP_NAME} SIGINT signal received. Shutting down ...`)
    shutDown(server, connections)
  })
  console.info(' - shutdown signals callbacks initialized')

  if (process.send != null) {
    process.send('ready')
    console.info(' - ready signal sent to pm2')
  }
}

const startupWithRetry = async () => {
  const FAILED_STARTUPS_COUNTER_FILENAME = 'failed.startups.counter'
  const filenameFailedStartupsCounter = path.resolve(FAILED_STARTUPS_COUNTER_DIRECTORY, FAILED_STARTUPS_COUNTER_FILENAME)

  try {
    await startup()
  } catch (error) {
    let attempts = 0
    try {
      if (fs.existsSync(filenameFailedStartupsCounter)) {
        attempts = Number(JSON.parse(fs.readFileSync(filenameFailedStartupsCounter, 'utf8')))
      }
    } catch (error) {
      console.error(`${APP_NAME} failed to read ${FAILED_STARTUPS_COUNTER_FILENAME} after failed startup`, error)
    }
    if (attempts % 10 === 0) {
      console.error(`${APP_NAME} startup failed (previous attempts: ${attempts}), exiting with exit code ${EXIT_CODE_FAILED_STARTUP}`)
    } else {
      console.warn(`${APP_NAME} startup failed (previous attempts: ${attempts}), exiting with exit code ${EXIT_CODE_FAILED_STARTUP}`)
    }
    try {
      fs.writeFileSync(filenameFailedStartupsCounter, JSON.stringify(attempts + 1))
    } catch (error) {
      console.error(`${APP_NAME} failed to write ${FAILED_STARTUPS_COUNTER_FILENAME} after failed startup`, error)
    }
    process.exit(EXIT_CODE_FAILED_STARTUP)
  }

  try {
    if (fs.existsSync(filenameFailedStartupsCounter)) {
      console.error(`${APP_NAME} recovery from startup errors successful`)
      fs.rmSync(filenameFailedStartupsCounter)
    }
  } catch (error) {
    console.error(`${APP_NAME} failed to check/remove ${FAILED_STARTUPS_COUNTER_FILENAME} after successful startup`, error)
  }
}

startupWithRetry()
