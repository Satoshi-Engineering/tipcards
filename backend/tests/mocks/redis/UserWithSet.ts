import { User } from '../../../../shared/src/data/redis/User'
import { Card } from '../../../../shared/src/data/redis/Card'
import { Set } from '../../../../shared/src/data/redis/Set'

export const USER = User.parse({
  id: 'testUserId',
  lnurlAuthKey: 'testUserLnurlAuthKey',
  created: + new Date() / 1000,
})

export const USER_SET_FUNDED = Set.parse({
  id: 'test-user-unfunded-set',
  settings: {
    numberOfCards: 2,
    cardHeadline: '',
    cardCopytext: '',
    cardsQrCodeLogo: '',
  },
  userId: USER.id,
})

export const USER_CARD_FUNDED_INVOICE = Card.parse({
  cardHash: '7f82aec63272b99511bf345eec1b631237cb7f099faa80e0f1daf4cc9287006a',
  invoice: {
    amount: 100,
    payment_hash: '',
    payment_request: '',
    created: 123,
    paid: 1234,
  },
})

export const USER_CARD_FUNDED_LNURLP = Card.parse({
  cardHash: '314a09fc8a0d3bc014d32ae3c19a74cb58b34f6923cbcae13ba653a1e920d470',
  lnurlp: {
    amount: 200,
    payment_hash: [],
    id: '123',
    created: 123,
    paid: 12345,
  },
})
