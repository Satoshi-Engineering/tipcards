import { Card } from '@backend/database/deprecated/data/Card.js'
import { Set } from '@backend/database/deprecated/data/Set.js'
import { BulkWithdraw } from '@backend/database/deprecated/data/BulkWithdraw.js'

import hashSha256 from '@backend/services/hashSha256.js'

export const SET_FUNDED = Set.parse({
  id: 'unitTestFundedSet',
  settings: {
    numberOfCards: 2,
    cardHeadline: '',
    cardCopytext: '',
    cardsQrCodeLogo: '',
  },
})

export const CARD_FUNDED_INVOICE = Card.parse({
  cardHash: hashSha256(`${SET_FUNDED.id}/0`),
  invoice: {
    amount: 100,
    payment_hash: '',
    payment_request: '',
    created: 123,
    paid: 1234,
  },
})

export const CARD_FUNDED_LNURLP = Card.parse({
  cardHash: hashSha256(`${SET_FUNDED.id}/1`),
  lnurlp: {
    amount: 200,
    payment_hash: [],
    id: '123',
    created: 123,
    paid: 12345,
  },
})

export const BULK_WITHDRAW = BulkWithdraw.parse({
  id: hashSha256(CARD_FUNDED_INVOICE.cardHash + CARD_FUNDED_LNURLP.cardHash),
  created: Math.round(+ new Date() / 1000),
  amount: 300,
  cards: [CARD_FUNDED_INVOICE.cardHash, CARD_FUNDED_LNURLP.cardHash],
  lnbitsWithdrawId: 'lnurlw123',
  lnurl: 'lnurl1dp68gurn8ghj7ar9wd6zuarfwp3kzunywvhxjmcnw2sew',
  withdrawn: null,
})
