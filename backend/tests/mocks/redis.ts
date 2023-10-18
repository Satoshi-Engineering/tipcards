export const regexSet = /tipcards:develop:setsById:(?<id>[a-z0-9-]+):data/
export const regexCard = /tipcards:develop:cardsByHash:(?<hash>[a-z0-9-]+):data/
export const regexBulkWithdraw = /tipcards:develop:bulkWithdrawById:(?<id>[a-z0-9-]+):data/

export const SET = {
  id: 'test-set-id',
}

export const SET_FUNDED = {
  id: 'funded-test-set-id',
  settings: {
    numberOfCards: 2,
    cardHeadline: '',
    cardCopytext: '',
    cardsQrCodeLogo: '',
  },
}

export const CARD_FUNDED_INVOICE = {
  cardHash: '74035b374f98f919d47a5a9bfc7b75c150f0b9b7a06c58016bc4490675406def',
  invoice: {
    amount: 100,
    payment_hash: '',
    payment_request: '',
    created: 123,
    paid: 1234,
  },
}

export const CARD_FUNDED_LNURLP = {
  cardHash: '23ff7cadab5a1bdeceb2ec2329a232e34c27b0454686ebf1db555195882c765a',
  lnurlp: {
    amount: 200,
    payment_hash: [],
    id: '123',
    created: 123,
    paid: 12345,
  },
}

export const BULK_WITHDRAW = {
  id: 'test-bulk-withdraw-id',
  created: new Date(),
  amount: 300,
  cards: [CARD_FUNDED_INVOICE.cardHash, CARD_FUNDED_LNURLP.cardHash],
  lnbitsWithdrawId: 'lnurlw123',
  lnurl: 'lnurl1dp68gurn8ghj7ar9wd6zuarfwp3kzunywvhxjmcnw2sew',
  withdrawn: null,
}

jest.mock('redis', () => ({
  createClient: () => ({
    on: () => undefined,
    quit: async () => undefined,
    connect: async () => undefined,
    exists: jest.fn().mockImplementation(async (path: string) => {
        if (path.match(regexSet)) {
          return true
        } else if (path.match(regexCard)) {
          return true
        } else if (path.match(regexBulkWithdraw)?.groups?.id === BULK_WITHDRAW.id) {
          return true
        }
        return null
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
        // mock sets
        if (path.match(regexSet)?.groups?.id === SET.id) {
          return SET
        }
        if (path.match(regexSet)?.groups?.id === SET_FUNDED.id) {
          return SET_FUNDED
        }
        if (path.match(regexSet)) {
          return {
            id: path.match(regexSet)?.groups?.id,
          }
        }

        // mock cards
        if (path.match(regexCard)?.groups?.hash === CARD_FUNDED_INVOICE.cardHash) {
          return CARD_FUNDED_INVOICE
        }
        if (path.match(regexCard)?.groups?.hash === CARD_FUNDED_LNURLP.cardHash) {
          return CARD_FUNDED_LNURLP
        }
        if (path.match(regexCard)) {
          return {
            cardHash: path.match(regexCard)?.groups?.hash,
          }
        }

        // mock bulkWithdraw
        if (path.match(regexBulkWithdraw)?.groups?.hash === BULK_WITHDRAW.id) {
          return BULK_WITHDRAW
        }
        if (path.match(regexBulkWithdraw)) {
          return {
            id: path.match(regexBulkWithdraw)?.groups?.id,
            created: new Date(),
            amount: 300,
            cards: [CARD_FUNDED_INVOICE.cardHash, CARD_FUNDED_LNURLP.cardHash],
            lnbitsWithdrawId: 'lnurlw123',
            lnurl: 'lnurl1dp68gurn8ghj7ar9wd6zuarfwp3kzunywvhxjmcnw2sew',
            withdrawn: null,
          }
        }

        return null
      }),
    },
  }),
  SchemaFieldTypes: {
    TEXT: 'TEST',
  },
}))
