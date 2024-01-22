/* eslint-disable no-console */
import 'dotenv/config'
import fs from 'fs'
import type { Socket } from 'net'
import path from 'path'

import { initSocketIo } from '@backend/api/auth'
import { initDatabase } from '@backend/database'
import { loadCoarsWhitelist } from '@backend/services/corsOptions'
import { initAllWorkers } from '@backend/worker'
import app from '@backend/app'
import { APP_NAME, EXPRESS_PORT, FAILED_STARTUPS_COUNTER_DIRECTORY } from '@backend/constants'

import { shutdown } from './shutdown'

const EXIT_CODE_FAILED_STARTUP = 129
const EXIT_CODE_PREMATURE_DATABASE_CLOSE = 130
const FAILED_STARTUPS_COUNTER_FILENAME = 'failed.startups.counter'
const filenameFailedStartupsCounter = path.resolve(FAILED_STARTUPS_COUNTER_DIRECTORY, FAILED_STARTUPS_COUNTER_FILENAME)

let shutdownCalled = false

export const startup = async () => {
  try {
    await startupApplication()
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

const startupApplication = async () => {
  console.info(`${APP_NAME} starting`)

  const onDatabaseConnectionEnded = () => {
    if (shutdownCalled) {
      return
    }
    console.error(`${APP_NAME} database connection ended without application shutdown! Shutting down application with exit code ${EXIT_CODE_PREMATURE_DATABASE_CLOSE}!`)
    shutdown(server, connections, EXIT_CODE_PREMATURE_DATABASE_CLOSE)
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

  let connections: Socket[] = []

  server.on('connection', (connection: Socket) => {
    connections.push(connection)
    connection.on('close', () => connections = connections.filter(curr => curr !== connection))
  })

  process.on('SIGTERM', () => {
    console.info(`${APP_NAME} SIGTERM signal received. Shutting down ...`)
    shutdownCalled = true
    shutdown(server, connections)
  })

  process.on('SIGINT', () => {
    console.info(`${APP_NAME} SIGINT signal received. Shutting down ...`)
    shutdownCalled = true
    shutdown(server, connections)
  })
  console.info(' - shutdown signals callbacks initialized')

  if (process.send != null) {
    process.send('ready')
    console.info(' - ready signal sent to pm2')
  }
}
