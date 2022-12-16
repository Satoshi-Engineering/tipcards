/* eslint-disable no-console */
import 'dotenv/config'
import type { Socket } from 'net'
import type http from 'http'

import app from './src/app'
import { initSocketIo } from './src/api/auth'
import { EXPRESS_PORT } from './src/constants'
import consoleOverride from './src/consoleOverride'

consoleOverride()

const APP_NAME = 'Node Backend'

const shutDown = (server: http.Server, connections: Array<Socket>) => {
  // Closing Server
  server.close(() => {
    console.info('Closed out remaining connections')
    process.exit(0)
  })

  // Closing all opened connection
  connections.forEach(curr => curr.end())
  setTimeout(() => connections.forEach(curr => curr.destroy()), 5000)

  // Timeout for forceclosing the connections
  setTimeout(() => {
    console.error('Could not close connections in time, forcefully shutting down')
    process.exit(1)
  }, 10000).unref()
}

const server = app.listen(EXPRESS_PORT, () => {
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
