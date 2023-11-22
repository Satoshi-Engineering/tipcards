import axios, { AxiosError, AxiosResponse } from 'axios'
import '../initEnv'

import { createCard, createCardVersion } from '../../drizzleData'
import { addData } from '../initDrizzle'
import Database from '@backend/database/drizzle/Database'

afterAll(() => {
  Database.closeConnectionIfExists()
})

describe('card', () => {
  it('should return 404 if the card doesn\' exist', async () => {
    let caughtError: AxiosError
    try {
      await axios.get(`${process.env.TEST_API_ORIGIN}/api-drizzle/card/aHashThatDoesntExist`)
      expect(false).toBe(true)
      return
    } catch (error) {
      caughtError = error as AxiosError
    }
    expect(axios.isAxiosError(caughtError)).toBe(true)
    expect(caughtError?.response?.status).toBe(404)
  })

  it('should return a card that exists in the database', async () => {
    const card = createCard()
    const cardVersion = createCardVersion(card)
    await addData({
      cards: [card],
      cardVersions: [cardVersion],
    })

    let response: AxiosResponse
    try {
      response = await axios.get(`${process.env.TEST_API_ORIGIN}/api-drizzle/card/${card.hash}`)
    } catch (error) {
      console.error(error)
      expect(false).toBe(true)
      return
    }
    expect(response.data.data).toEqual(expect.objectContaining({
      cardHash: card.hash,
      text: cardVersion.textForWithdraw,
      note: cardVersion.noteForStatusPage,
      invoice: null,
      lnurlp: null,
      setFunding: null,
      lnbitsWithdrawId: null,
      landingPageViewed: null,
      isLockedByBulkWithdraw: false,
      used: null,
    }))
  })
})
