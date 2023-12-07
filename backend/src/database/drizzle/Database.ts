import { drizzle } from 'drizzle-orm/mysql2'
import * as schema from './schema'
import mysql from 'mysql2/promise'
import type { MySql2Database } from 'drizzle-orm/mysql2/driver'

const MYSQL_PORT = parseInt(process.env.MYSQL_PORT || '3306')

export default class Database {
  static async getDatabase(): Promise<MySql2Database<typeof schema>> {
    if (Database.singleton == null) {
      await Database.create()
    }

    return Database.singleton.database as MySql2Database<typeof schema>
  }

  static async closeConnectionIfExists() {
    if (Database.singleton !== null) {
      await Database.singleton.deInit()
    }
  }

  private static singleton: Database

  private static async create() {
    Database.singleton = new Database()
    await Database.singleton.init()
  }

  private database: MySql2Database<typeof schema> | null
  private connection: mysql.Connection | null

  private constructor() {
    this.database = null
    this.connection = null
  }

  private async init() {
    this.connection = await mysql.createConnection({
      host: process.env.MYSQL_HOST,
      port: MYSQL_PORT,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DB_NAME,
      multipleStatements: true,
    })

    this.database = drizzle(this.connection, { mode: 'default', schema })
  }

  private async deInit() {
    await this.connection?.end()
  }
}
