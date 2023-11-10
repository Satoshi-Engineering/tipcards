import { drizzle } from 'drizzle-orm/mysql2'
import mysql from 'mysql2/promise'

export const getClient = async () => {
  const connection = await mysql.createConnection({
    host: 'host',
    user: 'user',
    database: 'database',
  })
   
  return drizzle(connection)
}
