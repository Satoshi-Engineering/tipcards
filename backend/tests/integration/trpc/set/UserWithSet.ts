import { User } from '@shared/data/redis/User'
import { Card } from '@shared/data/redis/Card'
import { Set } from '@shared/data/redis/Set'

import hashSha256 from '@backend/services/hashSha256'

export const USER = User.parse({
  id: 'setIntegrationTestUser',
  lnurlAuthKey: 'testUserLnurlAuthKey',
  created: + new Date() / 1000,
})

export const USER_SET_FUNDED = Set.parse({
  id: 'setIntegrationTestUserSetFunded',
  settings: {
    numberOfCards: 2,
    cardHeadline: '',
    cardCopytext: '',
    cardsQrCodeLogo: '',
  },
  userId: USER.id,
})

export const USER_CARD_FUNDED_INVOICE = Card.parse({
  cardHash: hashSha256(`${USER_SET_FUNDED.id}/0`),
  invoice: {
    amount: 100,
    payment_hash: '',
    payment_request: '',
    created: 123,
    paid: 1234,
  },
})

export const USER_CARD_FUNDED_LNURLP = Card.parse({
  cardHash: hashSha256(`${USER_SET_FUNDED.id}/1`),
  lnurlp: {
    amount: 200,
    payment_hash: [],
    id: '123',
    created: 123,
    paid: 12345,
  },
})
