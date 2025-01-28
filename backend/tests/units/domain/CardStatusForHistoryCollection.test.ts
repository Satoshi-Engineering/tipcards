import { describe, it, expect } from 'vitest'

import {
  createSet, createSetSettings, createCardForSet,
  createCard, createCardVersion,
} from '../../drizzleData.js'

import { CardStatusEnum } from '@shared/data/trpc/CardStatusDto.js'

import { CardVersion } from '@backend/database/schema/CardVersion.js'
import CardStatusForHistoryCollection from '@backend/domain/CardStatusForHistoryCollection.js'
import CardStatusForHistory from '@backend/domain/CardStatusForHistory.js'

describe('CardStatusCollection', async () => {
  const set = createSet()
  const setSettings = createSetSettings(set)
  const cards = [
    createCardForSet(set, 0),
    createCardForSet(set, 1),
    createCard(),
  ]
  const cardVersions: CardVersion[] = []
  cardVersions.push(createCardVersion(cards[0]))
  await new Promise((resolve) => setTimeout(resolve, 1))
  cardVersions.push(createCardVersion(cards[1]))
  await new Promise((resolve) => setTimeout(resolve, 1))
  cardVersions.push(createCardVersion(cards[2]))

  it('should load the statuses of multiple cards from cardHash', async () => {
    const statusCollection = new CardStatusForHistoryCollection([
      CardStatusForHistory.fromData({
        cardVersion: cardVersions[0],
        invoices: [],
        lnurlP: null,
        lnurlW: null,
        setSettings,
      }),
      CardStatusForHistory.fromData({
        cardVersion: cardVersions[1],
        invoices: [],
        lnurlP: null,
        lnurlW: null,
        setSettings,
      }),
    ])

    expect(statusCollection.data).toEqual([
      expect.objectContaining({
        cardVersion: expect.objectContaining({
          card: cards[0].hash,
        }),
        setSettings,
      }),
      expect.objectContaining({
        cardVersion: expect.objectContaining({
          card: cards[1].hash,
        }),
        setSettings,
      }),
    ])
  })

  it('should return a filtered and sorted trpc response', async () => {
    const collection = new CardStatusForHistoryCollection([
      CardStatusForHistory.fromData({
        cardVersion: cardVersions[2],
        invoices: [],
        lnurlP: null,
        lnurlW: null,
        setSettings: null,
      }),
      CardStatusForHistory.fromData({
        cardVersion: cardVersions[1],
        invoices: [],
        lnurlP: null,
        lnurlW: null,
        setSettings,
      }),
      CardStatusForHistory.fromData({
        cardVersion: cardVersions[0],
        invoices: [],
        lnurlP: null,
        lnurlW: null,
        setSettings,
      }),
    ])

    collection.filter = (cardStatus) => cardStatus.cardVersion.card !== cards[1].hash
    collection.sort = (a, b) => a.created.getTime() - b.created.getTime()
    const trpcResponse = collection.toTrpcResponse()

    expect(trpcResponse).toEqual({
      data: [{
        hash: cards[0].hash,
        status: CardStatusEnum.enum.unfunded,
        amount: null,
        feeAmount: null,
        created: cardVersions[0].created,
        funded: null,
        withdrawn: null,

        landingPageViewed: null,
        bulkWithdrawCreated: null,
        setId: setSettings.set,
        setName: setSettings.name,

        noteForStatusPage: cardVersions[0].noteForStatusPage,
        textForWithdraw: cardVersions[0].textForWithdraw,
      }, {
        hash: cards[2].hash,
        status: CardStatusEnum.enum.unfunded,
        amount: null,
        feeAmount: null,
        created: cardVersions[2].created,
        funded: null,
        withdrawn: null,

        landingPageViewed: null,
        bulkWithdrawCreated: null,
        setId: null,
        setName: null,

        noteForStatusPage: cardVersions[2].noteForStatusPage,
        textForWithdraw: cardVersions[2].textForWithdraw,
      }],
      totalUnfiltered: 3,
    })
  })

  it('should handle pagination', async () => {
    const collection = new CardStatusForHistoryCollection([
      CardStatusForHistory.fromData({
        cardVersion: cardVersions[2],
        invoices: [],
        lnurlP: null,
        lnurlW: null,
        setSettings: null,
      }),
      CardStatusForHistory.fromData({
        cardVersion: cardVersions[1],
        invoices: [],
        lnurlP: null,
        lnurlW: null,
        setSettings,
      }),
      CardStatusForHistory.fromData({
        cardVersion: cardVersions[0],
        invoices: [],
        lnurlP: null,
        lnurlW: null,
        setSettings,
      }),
    ])

    collection.filter = (cardStatus) => cardStatus.cardVersion.card !== cards[1].hash
    collection.sort = (a, b) => a.created.getTime() - b.created.getTime()
    collection.pagination = { offset: 1, limit: 1 }
    const trpcResponse = collection.toTrpcResponse()

    expect(trpcResponse).toEqual({
      data: [{
        hash: cards[2].hash,
        status: CardStatusEnum.enum.unfunded,
        amount: null,
        feeAmount: null,
        created: cardVersions[2].created,
        funded: null,
        withdrawn: null,

        landingPageViewed: null,
        bulkWithdrawCreated: null,
        setId: null,
        setName: null,

        noteForStatusPage: cardVersions[2].noteForStatusPage,
        textForWithdraw: cardVersions[2].textForWithdraw,
      }],
      pagination: {
        offset: 1,
        limit: 1,
        total: 2,
      },
      totalUnfiltered: 3,
    })
  })
})
