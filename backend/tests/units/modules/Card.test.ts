import '../mocks/process.env'
import '../mocks/axios'
import { addCards } from '../mocks/redis'

import { CARD_FUNDED_INVOICE } from '../data/FundedSetWithBulkWithdraw'

import Card from '@backend/modules/Card'

beforeEach(() => {
  addCards(CARD_FUNDED_INVOICE)
})

describe('Card', () => {
  it('should load a card from cardHash', async () => {
    const card = await Card.fromCardHash(CARD_FUNDED_INVOICE.cardHash)
    const data = await card.toTRpcResponse()
    expect(data.hash).toBe(CARD_FUNDED_INVOICE.cardHash)
    expect(data.invoice).not.toBeNull()
  })

  it('should load a card that doesnt exist', async () => {
    const imaginedCardId = 'some random string that doesnt exist'
    const card = await Card.fromCardHash(imaginedCardId)
    const data = await card.toTRpcResponse()
    expect(data.hash).toBe(imaginedCardId)
    expect(data.invoice).toBeNull()
  })
})
