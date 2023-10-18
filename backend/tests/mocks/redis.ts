import { SET_EMPTY } from './redis/EmptySet'
import { SET_FUNDED, CARD_FUNDED_INVOICE, CARD_FUNDED_LNURLP, BULK_WITHDRAW } from './redis/FundedSetWithBulkWithdraw'
import { SET_UNFUNDED, CARD_UNFUNDED_INVOICE, CARD_UNFUNDED_LNURLP } from './redis/SetWithUnfundedCards'

export const regexSet = /tipcards:develop:setsById:(?<id>[a-z0-9-]+):data/
export const regexCard = /tipcards:develop:cardsByHash:(?<hash>[a-z0-9-]+):data/
export const regexBulkWithdraw = /tipcards:develop:bulkWithdrawById:(?<id>[a-z0-9-]+):data/

const SetsById = {
  [SET_EMPTY.id]: SET_EMPTY,
  [SET_FUNDED.id]: SET_FUNDED,
  [SET_UNFUNDED.id]: SET_UNFUNDED,
}

const CardsByHash = {
  [CARD_FUNDED_INVOICE.cardHash]: CARD_FUNDED_INVOICE,
  [CARD_FUNDED_LNURLP.cardHash]: CARD_FUNDED_LNURLP,
  [CARD_UNFUNDED_INVOICE.cardHash]: CARD_UNFUNDED_INVOICE,
  [CARD_UNFUNDED_LNURLP.cardHash]: CARD_UNFUNDED_LNURLP,
}

const BulkWithdrawById = {
  [BULK_WITHDRAW.id]: BULK_WITHDRAW,
}

jest.mock('redis', () => ({
  createClient: () => ({
    on: () => undefined,
    quit: async () => undefined,
    connect: async () => undefined,
    exists: jest.fn().mockImplementation(async (path: string) => {
      if (path.match(regexSet)) {
        const setId = path.match(regexSet)?.groups?.id || ''
        return SetsById[setId] != null
      }
      if (path.match(regexCard)) {
        const cardHash = path.match(regexCard)?.groups?.hash || ''
        return CardsByHash[cardHash] != null
      }
      if (path.match(regexBulkWithdraw)) {
        const bulkWithdrawId = path.match(regexBulkWithdraw)?.groups?.id || ''
        return BulkWithdrawById[bulkWithdrawId] != null
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
          return SetsById[setId] || null
        }
        if (path.match(regexCard)) {
          const cardHash = path.match(regexCard)?.groups?.hash || ''
          return CardsByHash[cardHash] || null
        }
        if (path.match(regexBulkWithdraw)) {
          const bulkWithdrawId = path.match(regexBulkWithdraw)?.groups?.id || ''
          return BulkWithdrawById[bulkWithdrawId] || null
        }

        return null
      }),
    },
  }),
  SchemaFieldTypes: {
    TEXT: 'TEST',
  },
}))
