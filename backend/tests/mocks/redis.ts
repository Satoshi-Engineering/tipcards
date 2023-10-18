import { BulkWithdraw } from '../../../src/data/redis/BulkWithdraw'
import { Card } from '../../../src/data/redis/Card'
import { Set } from '../../../src/data/redis/Set'

export const regexSet = /tipcards:develop:setsById:(?<id>[a-z0-9-]+):data/
export const regexCard = /tipcards:develop:cardsByHash:(?<hash>[a-z0-9-]+):data/
export const regexBulkWithdraw = /tipcards:develop:bulkWithdrawById:(?<id>[a-z0-9-]+):data/

let setsById: Record<string, Set> = {}
export const initSets = (value: Record<string, Set>) => {
  setsById = value
}

let cardsByHash: Record<string, Card> = {}
export const initCards = (value: Record<string, Card>) => {
  cardsByHash = value
}

let bulkWithdrawsById: Record<string, BulkWithdraw> = {}
export const initBulkWithdraws = (value: Record<string, BulkWithdraw>) => {
  bulkWithdrawsById = value
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
    scanIterator: async () => [],
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
