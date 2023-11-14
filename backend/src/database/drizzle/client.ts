import { drizzle } from 'drizzle-orm/mysql2'
import mysql from 'mysql2/promise'

import * as schema from './schema'
const MYSQL_PORT = parseInt(process.env.MYSQL_PORT || '3306')

export const getClient = async () => {
  const connection = await mysql.createConnection({
    host: process.env.MYSQL_HOST,
    port: MYSQL_PORT,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DB_NAME,
    multipleStatements: true,
 })
   
  return drizzle(connection, { mode: 'default', schema })
}
