/* eslint-disable no-console */
import fs from 'fs'
import type { Socket } from 'net'
import path from 'path'

import Auth from '@auth/domain/Auth.js'
import Database from '@backend/database/Database.js'
import ApplicationEventEmitter from '@backend/domain/ApplicationEventEmitter.js'
import CardLockManager from '@backend/domain/CardLockManager.js'
import { loadCoarsWhitelist } from '@backend/services/corsOptions.js'
import initApp from '@backend/app.js'
import { APP_NAME, EXPRESS_PORT, FAILED_STARTUPS_COUNTER_DIRECTORY, JWT_AUTH_AUDIENCE } from '@backend/constants.js'
import { shutdown } from '@backend/shutdown.js'

const EXIT_CODE_FAILED_STARTUP = 129
const FAILED_STARTUPS_COUNTER_FILENAME = 'failed.startups.counter'
const filenameFailedStartupsCounter = path.resolve(FAILED_STARTUPS_COUNTER_DIRECTORY, FAILED_STARTUPS_COUNTER_FILENAME)
const CARDLOCKMANAGER_AQUIRE_TIMEOUT = 9000

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

  await Database.init()
  console.info(' - Database connected')

  await loadCoarsWhitelist()
  console.info(' - CORS whitelist loaded')

  await Auth.init(JWT_AUTH_AUDIENCE)
  console.info(' - Auth initialized')

  ApplicationEventEmitter.init()
  console.info(' - ApplicationEventEmitter initialized')

  CardLockManager.init({ aquireTimeout: CARDLOCKMANAGER_AQUIRE_TIMEOUT })
  console.info(' - CardLockManager initialized')

  const app = initApp()
  console.info(' - app started')

  const server = app.listen(EXPRESS_PORT, async () => {
    console.info(` - app running and listening on port ${EXPRESS_PORT}`)
  })
  let connections: Socket[] = []

  server.on('connection', (connection: Socket) => {
    connections.push(connection)
    connection.on('close', () => connections = connections.filter(curr => curr !== connection))
  })

  process.on('SIGTERM', () => {
    console.info(`${APP_NAME} SIGTERM signal received. Shutting down ...`)
    shutdown(server, connections)
  })

  process.on('SIGINT', () => {
    console.info(`${APP_NAME} SIGINT signal received. Shutting down ...`)
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
    console.warn(
      `${APP_NAME} startup failed (previous attempts: ${attempts}), exiting with exit code ${EXIT_CODE_FAILED_STARTUP}. This is a warning so we do not spam the telegram bot.`,
      error,
    )
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
