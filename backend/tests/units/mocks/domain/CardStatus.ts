import { randomUUID } from 'node:crypto'
import { vi } from 'vitest'

import { CardStatusDto, CardStatusEnum } from '@shared/data/trpc/CardStatusDto.js'

import { Card, CardVersion } from '@backend/database/schema/index.js'

vi.mock('@backend/domain/CardStatus.js', () => ({
  default: MockCardStatus,
}))

export const addCard = (card: Card) => {
  mocks[card.hash] = card
}

const mocks: Record<string, Card> = {}

class MockCardStatus {
  public static async latestFromCardHashOrDefault(cardHash: Card['hash']) {
    if (mocks[cardHash]) {
      return new MockCardStatus({
        id: randomUUID(),
        card: cardHash,
        created: mocks[cardHash].created,
        lnurlP: null,
        lnurlW: null,
        textForWithdraw: '',
        noteForStatusPage: '',
        sharedFunding: false,
        landingPageViewed: null,
      })
    }
    return new MockCardStatus({
      id: '00000000-0000-0000-0000-000000000000',
      card: cardHash,
      created: new Date(),
      lnurlP: null,
      lnurlW: null,
      textForWithdraw: '',
      noteForStatusPage: '',
      sharedFunding: false,
      landingPageViewed: null,
    })
  }

  public toTrpcResponse(): CardStatusDto {
    return {
      hash: this.cardVersion.card,

      status: CardStatusEnum.enum.unfunded,
      amount: null,
      created: this.cardVersion.created,
      funded: null,
      withdrawn: null,
    }
  }

  private readonly cardVersion: CardVersion

  private constructor(cardVersion: CardVersion) {
    this.cardVersion = cardVersion
  }
}
