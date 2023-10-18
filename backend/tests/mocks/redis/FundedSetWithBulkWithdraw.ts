import { Card } from '../../../../src/data/redis/Card'
import { Set } from '../../../../src/data/redis/Set'
import { BulkWithdraw } from '../../../../src/data/redis/BulkWithdraw'

export const SET_FUNDED = Set.parse({
  id: 'funded-test-set-id',
  settings: {
    numberOfCards: 2,
    cardHeadline: '',
    cardCopytext: '',
    cardsQrCodeLogo: '',
  },
})

export const CARD_FUNDED_INVOICE = Card.parse({
  cardHash: '74035b374f98f919d47a5a9bfc7b75c150f0b9b7a06c58016bc4490675406def',
  invoice: {
    amount: 100,
    payment_hash: '',
    payment_request: '',
    created: 123,
    paid: 1234,
  },
})

export const CARD_FUNDED_LNURLP = Card.parse({
  cardHash: '23ff7cadab5a1bdeceb2ec2329a232e34c27b0454686ebf1db555195882c765a',
  lnurlp: {
    amount: 200,
    payment_hash: [],
    id: '123',
    created: 123,
    paid: 12345,
  },
})

export const BULK_WITHDRAW = BulkWithdraw.parse({
  id: 'c84209c7dab604d27280dd2e993f8b0ed7edcfddc1e14fd248ee179175723c8f',
  created: Math.round(+ new Date() / 1000),
  amount: 300,
  cards: [CARD_FUNDED_INVOICE.cardHash, CARD_FUNDED_LNURLP.cardHash],
  lnbitsWithdrawId: 'lnurlw123',
  lnurl: 'lnurl1dp68gurn8ghj7ar9wd6zuarfwp3kzunywvhxjmcnw2sew',
  withdrawn: null,
})
