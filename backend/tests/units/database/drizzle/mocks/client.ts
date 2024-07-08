import { vi } from 'vitest'

import Queries from './Queries'

export const queries = new Queries()

const asTransaction = async <T>(executeQueries: (queries: typeof Queries) => Promise<T>): Promise<T> => executeQueries(queries)

vi.mock('@backend/database/drizzle/client', () => ({ asTransaction }))
