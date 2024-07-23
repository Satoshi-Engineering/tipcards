import { Card } from '@backend/database/deprecated/data/Card.js'
import { Set } from '@backend/database/deprecated/data/Set.js'

import hashSha256 from '@backend/services/hashSha256.js'

export const SET_UNFUNDED = Set.parse({
  id: 'unitTestUnfundedSet',
  settings: {
    numberOfCards: 2,
    cardHeadline: '',
    cardCopytext: '',
    cardsQrCodeLogo: '',
  },
})

export const CARD_UNFUNDED_INVOICE = Card.parse({
  cardHash: hashSha256(`${SET_UNFUNDED.id}/0`),
  invoice: {
    amount: 100,
    payment_hash: '',
    payment_request: '',
    created: 123,
    paid: null,
  },
})

export const CARD_UNFUNDED_LNURLP = Card.parse({
  cardHash: hashSha256(`${SET_UNFUNDED.id}/1`),
  lnurlp: {
    amount: null,
    payment_hash: [],
    id: '123',
    created: 123,
    paid: null,
  },
})
