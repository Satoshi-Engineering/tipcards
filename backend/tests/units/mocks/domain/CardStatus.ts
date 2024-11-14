import { randomUUID } from 'node:crypto'
import { vi } from 'vitest'

import { CardStatusDto, CardStatusEnum } from '@shared/data/trpc/CardStatusDto.js'

import { Card, CardVersion } from '@backend/database/schema/index.js'

vi.mock('@backend/domain/CardStatus.js', () => ({
  default: MockCardStatus,
}))

export const addCard = (card: Card, status?: CardStatusEnum, amount?: number) => {
  mocks[card.hash] = {
    card,
    status,
    amount,
  }
}

const mocks: Record<string, { card: Card, status?: CardStatusEnum, amount?: number }> = {}

class MockCardStatus {
  public static async latestFromCardHashOrDefault(cardHash: Card['hash']) {
    if (mocks[cardHash]) {
      return new MockCardStatus({
        id: randomUUID(),
        card: cardHash,
        created: mocks[cardHash].card.created,
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

  public get status(): CardStatusEnum {
    return mocks[this.cardVersion.card].status ?? CardStatusEnum.enum.unfunded
  }

  public get amount(): number | null {
    return mocks[this.cardVersion.card].amount ?? null
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
