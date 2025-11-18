import { randomUUID } from 'node:crypto'
import { vi } from 'vitest'

import { CardStatusDto, CardStatusEnum } from '@shared/data/trpc/CardStatusDto.js'
import { calculateFeeForNetAmount } from '@shared/modules/feeCalculation.js'

import { Card, CardVersion } from '@backend/database/schema/index.js'

vi.mock('@backend/domain/LiveCardStatus.js', () => ({
  default: MockLiveCardStatus,
}))

export const addCard = (card: Card, status?: CardStatusEnum, amount?: number) => {
  mocks[card.hash] = {
    card,
    status,
    amount,
    feeAmount: amount != null ? calculateFeeForNetAmount(amount): undefined,
  }
}

const mocks: Record<string, { card: Card, status?: CardStatusEnum, amount?: number, feeAmount?: number }> = {}

class MockLiveCardStatus {
  public static async latestFromCardHashOrDefault(cardHash: Card['hash']) {
    if (mocks[cardHash]) {
      return new MockLiveCardStatus({
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
    return new MockLiveCardStatus({
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

  public get feeAmount(): number | null {
    return mocks[this.cardVersion.card].feeAmount ?? null
  }

  public toTrpcResponse(): CardStatusDto {
    return {
      hash: this.cardVersion.card,
      status: CardStatusEnum.enum.unfunded,
      amount: this.amount,
      feeAmount: this.feeAmount,
    }
  }

  private readonly cardVersion: CardVersion

  private constructor(cardVersion: CardVersion) {
    this.cardVersion = cardVersion
  }
}
