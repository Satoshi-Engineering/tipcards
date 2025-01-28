import { describe, it, expect } from 'vitest'

import { createCard, createCardVersion } from '../../drizzleData.js'

import { CardStatusEnum } from '@shared/data/trpc/CardStatusDto.js'

import { CardVersion } from '@backend/database/schema/CardVersion.js'
import CardStatusCollection from '@backend/domain/CardStatusCollection.js'
import CardStatus from '@backend/domain/CardStatus.js'

describe('CardStatusCollection', async () => {
  const cards = [
    createCard(),
    createCard(),
    createCard(),
  ]
  const cardVersions: CardVersion[] = []
  cardVersions.push(createCardVersion(cards[0]))
  await new Promise((resolve) => setTimeout(resolve, 1))
  cardVersions.push(createCardVersion(cards[1]))
  await new Promise((resolve) => setTimeout(resolve, 1))
  cardVersions.push(createCardVersion(cards[2]))

  it('should load the statuses of multiple cards from cardHash', async () => {
    const statusCollection = new CardStatusCollection([
      CardStatus.fromData({
        cardVersion: cardVersions[0],
        invoices: [],
        lnurlP: null,
        lnurlW: null,
      }),
      CardStatus.fromData({
        cardVersion: cardVersions[1],
        invoices: [],
        lnurlP: null,
        lnurlW: null,
      }),
    ])

    expect(statusCollection.data).toEqual([
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

  it('should return a filtered and sorted trpc response', async () => {
    const collection = new CardStatusCollection([
      CardStatus.fromData({
        cardVersion: cardVersions[2],
        invoices: [],
        lnurlP: null,
        lnurlW: null,
      }),
      CardStatus.fromData({
        cardVersion: cardVersions[1],
        invoices: [],
        lnurlP: null,
        lnurlW: null,
      }),
      CardStatus.fromData({
        cardVersion: cardVersions[0],
        invoices: [],
        lnurlP: null,
        lnurlW: null,
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
      }, {
        hash: cards[2].hash,
        status: CardStatusEnum.enum.unfunded,
        amount: null,
        feeAmount: null,
      }],
      totalUnfiltered: 3,
    })
  })

  it('should handle pagination', async () => {
    const collection = new CardStatusCollection([
      CardStatus.fromData({
        cardVersion: cardVersions[2],
        invoices: [],
        lnurlP: null,
        lnurlW: null,
      }),
      CardStatus.fromData({
        cardVersion: cardVersions[1],
        invoices: [],
        lnurlP: null,
        lnurlW: null,
      }),
      CardStatus.fromData({
        cardVersion: cardVersions[0],
        invoices: [],
        lnurlP: null,
        lnurlW: null,
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
