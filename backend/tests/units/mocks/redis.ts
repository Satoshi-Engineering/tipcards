import type { BulkWithdraw } from '@backend/database/redis/data/BulkWithdraw'
import type { Card } from '@backend/database/redis/data/Card'
import type { Set } from '@backend/database/redis/data/Set'

export const regexSet = /tipcards:develop:setsById:(?<id>[a-zA-Z0-9-]+):data/
export const regexCard = /tipcards:develop:cardsByHash:(?<hash>[a-zA-Z0-9-]+):data/
export const regexBulkWithdraw = /tipcards:develop:bulkWithdrawById:(?<id>[a-zA-Z0-9-]+):data/

const setsById: Record<string, Set> = {}
const cardsByHash: Record<string, Card> = {}
const bulkWithdrawsById: Record<string, BulkWithdraw> = {}

export const addSets = (...sets: Set[]) => {
  addItemsToTable(setsById, sets.map((set) => ({ key: set.id, item: set})))
}
export const addCards = (...cards: Card[]) => {
  addItemsToTable(cardsByHash, cards.map((card) => ({ key: card.cardHash, item: card})))
}
export const addBulkWithdraws = (...bulkWithdraws: BulkWithdraw[]) => {
  addItemsToTable(bulkWithdrawsById, bulkWithdraws.map((bulkWithdraw) => ({ key: bulkWithdraw.id, item: bulkWithdraw})))
}

const addItemsToTable = <I>(table: Record<string, I>, items: { key: string, item: I }[]) => {
  items.forEach((item) => addItemToTable(table, item))
}
const addItemToTable = <I>(table: Record<string, I>, { key, item }: { key: string, item: I }) => {
  table[key] = item
}

jest.mock('redis', () => ({
  createClient: () => ({
    on: () => undefined,
    quit: async () => undefined,
    connect: async () => undefined,
    exists: jest.fn().mockImplementation(async (path: string) => {
      if (path.match(regexSet)) {
        const setId = path.match(regexSet)?.groups?.id || ''
        return setsById[setId] != null
      }
      if (path.match(regexCard)) {
        const cardHash = path.match(regexCard)?.groups?.hash || ''
        return cardsByHash[cardHash] != null
      }
      if (path.match(regexBulkWithdraw)) {
        const bulkWithdrawId = path.match(regexBulkWithdraw)?.groups?.id || ''
        return bulkWithdrawsById[bulkWithdrawId] != null
      }
      return false
    }),
    scanIterator: ({ MATCH }: { MATCH: string }) => {
      if (MATCH.includes('bulkWithdrawById')) {
        return (async function* () {
          for (const bulkWithdrawId in bulkWithdrawsById) {
            yield `tipcards:develop:bulkWithdrawById:${bulkWithdrawId}:data`
          }
        })()
      }
      return (async function* () {
        for (const value in []) {
          yield value
        }
      })()
    },
    del: async () => undefined,
    ft: {
      dropIndex: async () => undefined,
      create: async () => undefined,
      search: async () => ({
        total: 0,
        documents: [],
      }),
    },
    json: {
      set: async () => undefined,
      get: jest.fn().mockImplementation(async (path: string) => {
        if (path.match(regexSet)) {
          const setId = path.match(regexSet)?.groups?.id || ''
          return setsById[setId] || null
        }
        if (path.match(regexCard)) {
          const cardHash = path.match(regexCard)?.groups?.hash || ''
          return cardsByHash[cardHash] || null
        }
        if (path.match(regexBulkWithdraw)) {
          const bulkWithdrawId = path.match(regexBulkWithdraw)?.groups?.id || ''
          return bulkWithdrawsById[bulkWithdrawId] || null
        }
        return null
      }),
    },
  }),
  SchemaFieldTypes: {
    TEXT: 'TEST',
  },
}))
