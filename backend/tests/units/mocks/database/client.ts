import { vi } from 'vitest'

import Queries from './Queries.js'

export const queries = new Queries()

const asTransaction = async <T>(executeQueries: (queries: typeof Queries) => Promise<T>): Promise<T> => executeQueries(queries)

vi.mock('@backend/database/client', () => ({ asTransaction }))
