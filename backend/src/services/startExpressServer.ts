import type { Express } from 'express'
import type { Server } from 'http'

export default (app: Express, port: number) => new Promise<Server>((resolve, reject) => {
  const server = app.listen(port, (error) => {
    if (error != null) {
      reject(error)
      return
    }
    resolve(server)
  })
})
