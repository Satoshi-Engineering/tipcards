import '../initEnv'

import axios, { AxiosError } from 'axios'

import { cardData } from '../../apiData'
import FrontendSimulator from '../frontend/FrontendSimulator'

const frontend = new FrontendSimulator()

const cardHash = cardData.generateCardHash()
describe('lnurlp without funding', () => {
  it('should create a card when the lnurl link is used directly', async () => {
    const { data } = await frontend.loadLnurlForCardHash(cardHash)
    expect(data).toEqual(expect.objectContaining({
      tag: 'payRequest',
    }))
  })

  it('should be visible in the card status', async () => {
    const { data } = await frontend.loadCard(cardHash)
    expect(data).toEqual(expect.objectContaining({
      status: 'success',
      data: expect.objectContaining({
        cardHash,
        invoice: null,
        setFunding: null,
        lnbitsWithdrawId: null,
        withdrawPending: false,
        landingPageViewed: null,
        isLockedByBulkWithdraw: false,
        used: null,
        lnurlp: expect.objectContaining({
          shared: false,
          amount: null,
          payment_hash: null,
          id: expect.any(String),
          created: expect.any(Number),
          paid: null,
          expired: false,
        }),
      }),
    }))
  })

  it('should be able to delete the card', async () => {
    const { data } = await frontend.deleteCard(cardHash)
    expect(data).toEqual(expect.objectContaining({
      status: 'success',
    }))
  })

  it('should return 404 after the card was deleted', async () => {
    let caughtError: AxiosError | undefined = undefined
    try {
      await frontend.loadCard(cardHash)
    } catch (error) {
      caughtError = error as AxiosError
    }
    expect(axios.isAxiosError(caughtError)).toBe(true)
    expect(caughtError?.response?.status).toBe(404)
  })
})
