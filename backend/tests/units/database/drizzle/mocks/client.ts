import Queries from './Queries'

export const queries = new Queries()

const asTransaction = async <T>(executeQueries: (queries: typeof Queries) => Promise<T>): Promise<T> => executeQueries(queries)

jest.mock('@backend/database/drizzle/client', () => ({ asTransaction }))
