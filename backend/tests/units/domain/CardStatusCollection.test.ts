import { describe, it, expect } from 'vitest'

import { createCard } from '../../drizzleData.js'

import CardStatusCollection from '@backend/domain/CardStatusCollection.js'
import CardStatus from '@backend/domain/CardStatus.js'

const cards = [createCard(), createCard()]

describe('CardStatusCollection', () => {
  it('should load the statuses multiple cards from cardHash', async () => {
    const statusCollection = CardStatusCollection.fromCardStatuses([
      CardStatus.fromData({
        cardVersion: {
          id: '00000000-0000-0000-0000-000000000000',
          card: cards[0].hash,
          created: new Date(),
          lnurlP: null,
          lnurlW: null,
          textForWithdraw: '',
          noteForStatusPage: '',
          sharedFunding: false,
          landingPageViewed: null,
        },
        invoices: [],
        lnurlP: null,
        lnurlW: null,
      }),
      CardStatus.fromData({
        cardVersion: {
          id: '00000000-0000-0000-0000-000000000000',
          card: cards[1].hash,
          created: new Date(),
          lnurlP: null,
          lnurlW: null,
          textForWithdraw: '',
          noteForStatusPage: '',
          sharedFunding: false,
          landingPageViewed: null,
        },
        invoices: [],
        lnurlP: null,
        lnurlW: null,
      }),
    ])

    expect(statusCollection.cardStatuses).toEqual([
      expect.objectContaining({
        cardVersion: expect.objectContaining({
          card: cards[0].hash,
        }),
      }),
      expect.objectContaining({
        cardVersion: expect.objectContaining({
          card: cards[1].hash,
        }),
      }),
    ])
  })
})
