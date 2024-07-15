import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js/driver'

import { DB_CREDENTIALS } from '@backend/constants.js'

import * as schema from './schema/index.js'

export default class Database {
  static async init() {
    if (Database.singleton != null) {
      throw new Error('Drizzle database already initialized!')
    }

    Database.singleton = new Database()
    await Database.singleton.init()
  }

  static async getDatabase(): Promise<PostgresJsDatabase<typeof schema>> {
    if (Database.singleton == null) {
      throw new Error('Drizzle getDatabase called before init!')
    }

    return Database.singleton.database as PostgresJsDatabase<typeof schema>
  }

  static async closeConnectionIfExists() {
    if (Database.singleton != null) {
      await Database.singleton.deInit()
    }
  }

  private static singleton: Database

  private database: PostgresJsDatabase<typeof schema> | null
  private connection: postgres.Sql | null

  private constructor() {
    this.database = null
    this.connection = null
  }

  private async init() {
    this.connection = postgres(`postgres://${DB_CREDENTIALS.user}:${DB_CREDENTIALS.password}@${DB_CREDENTIALS.host}:${DB_CREDENTIALS.port}/${DB_CREDENTIALS.database}`)
    this.database = drizzle(this.connection, { schema })
  }

  private async deInit() {
    await this.connection?.end()
  }
}
