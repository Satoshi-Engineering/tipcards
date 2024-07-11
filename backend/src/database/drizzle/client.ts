import Database from './Database.js'
import Queries from './Queries.js'

export const getClient = async () => {
  return await Database.getDatabase()
}

export const asTransaction = async <T>(executeQueries: (queries: Queries) => Promise<T>): Promise<T> => {
  const client = await getClient()
  return client.transaction(async (transaction) => {
    const queries = new Queries(transaction)
    return executeQueries(queries)
  })
}
