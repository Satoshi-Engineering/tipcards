import { Card } from '../../../../src/data/redis/Card'
import { Set } from '../../../../src/data/redis/Set'

export const SET_UNFUNDED = Set.parse({
  id: 'unfunded-test-set-id',
  settings: {
    numberOfCards: 2,
    cardHeadline: '',
    cardCopytext: '',
    cardsQrCodeLogo: '',
  },
})

export const CARD_UNFUNDED_INVOICE = Card.parse({
  cardHash: 'dd81045ed9e86a4c14271de4da91f9f93987032d9f79019a1d8ed9cf226ae0d2',
  invoice: {
    amount: 100,
    payment_hash: '',
    payment_request: '',
    created: 123,
    paid: null,
  },
})

export const CARD_UNFUNDED_LNURLP = Card.parse({
  cardHash: '3975d648991f6ba5e49c89c801ae04385b8087670037e260c27c35fa1ecf9f43',
  lnurlp: {
    amount: null,
    payment_hash: [],
    id: '123',
    created: 123,
    paid: null,
  },
})
