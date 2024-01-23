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
    await logFailedStartup(error)
    process.exit(EXIT_CODE_FAILED_STARTUP)
  }

  logStartupIfItFailedBefore()
}

const startupApplication = async () => {
  console.info(`${APP_NAME} starting`)

  const onDatabaseConnectionEnded = async () => {
    if (shutdownCalled) {
      return
    }
    await console.error(`${APP_NAME} database connection ended without application shutdown! Shutting down application with exit code ${EXIT_CODE_PREMATURE_DATABASE_CLOSE}!`)
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

const logFailedStartup = async (error: unknown) => {
  const attempts = await getPreviousAttempts()
  if (attempts % 10 === 0) {
    await console.error(`${APP_NAME} startup failed (previous attempts: ${attempts}), exiting with exit code ${EXIT_CODE_FAILED_STARTUP}`, error)
  } else {
    console.warn(`${APP_NAME} startup failed (previous attempts: ${attempts}), exiting with exit code ${EXIT_CODE_FAILED_STARTUP}. This is a warning so we do not spam the telegram bot.`, error)
  }
  await writeAttempts(attempts + 1)
}

const getPreviousAttempts = async () => {
  if (!fs.existsSync(filenameFailedStartupsCounter)) {
    return 0
  }
  try {
    return Number(JSON.parse(fs.readFileSync(filenameFailedStartupsCounter, 'utf8')))
  } catch (error) {
    await console.error(`${APP_NAME} failed to read/parse ${filenameFailedStartupsCounter} after failed startup`, error)
  }
  return 0
}

const writeAttempts = async (attempts: number) => {
  try {
    fs.writeFileSync(filenameFailedStartupsCounter, JSON.stringify(attempts))
  } catch (error) {
    await console.error(`${APP_NAME} failed to write ${filenameFailedStartupsCounter} after failed startup`, error)
  }
}

const logStartupIfItFailedBefore = () => {
  if (!fs.existsSync(filenameFailedStartupsCounter)) {
    return
  }
  console.error(`${APP_NAME} recovery from startup errors successful`)

  try {
    fs.rmSync(filenameFailedStartupsCounter)
  } catch (error) {
    console.error(`${APP_NAME} failed to remove ${filenameFailedStartupsCounter} after startup recovery`, error)
  }
}
