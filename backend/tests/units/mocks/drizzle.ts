jest.mock('mysql2/promise', () => ({ createConnection: () => null }))

jest.mock('drizzle-orm/mysql2', () => ({
  drizzle: () => ({ select }),
}))

const select = () => new ChainablePromise((resolve) => {
  resolve(mockData.shift())
})

class ChainablePromise<T> extends Promise<T> {
  from() {
    return this
  }
  innerJoin() {
    return this
  }
  orderBy() {
    return this
  }
  where() {
    return this
  }
  limit() {
    return this
  }
}

const mockData: unknown[] = []

export const pushMockData = (data: unknown) => mockData.push(data)
