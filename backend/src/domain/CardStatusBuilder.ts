import { Card, CardVersion } from '@backend/database/schema/index.js'
import { asTransaction } from '@backend/database/client.js'

import CardStatusCollection from './CardStatusCollection.js'
import CardStatus from './CardStatus.js'

const defaultCardVersion = {
  id: '00000000-0000-0000-0000-000000000000',
  created: new Date(),
  lnurlP: null,
  lnurlW: null,
  textForWithdraw: '',
  noteForStatusPage: '',
  sharedFunding: false,
  landingPageViewed: null,
}

export default class CardStatusBuilder {
  public readonly cardHashes: Card['hash'][]

  public constructor(cardHashes: Card['hash'] | Card['hash'][]) {
    if (Array.isArray(cardHashes)) {
      this.cardHashes = cardHashes
    } else {
      this.cardHashes = [cardHashes]
    }
  }

  public async build(): Promise<void> {
    await this.loadCardVersion()
  }

  public getResult(): CardStatus | CardStatusCollection {
    const cardStatuses = this.cardHashes.map((cardHash) => {
      if (!this.cardVersions[cardHash]) {
        return CardStatus.fromData({
          cardVersion: { ...defaultCardVersion, card: cardHash },
        })
      }
      return CardStatus.fromData({
        cardVersion: this.cardVersions[cardHash],
      })
    })
    if (cardStatuses.length === 1) {
      return cardStatuses[0]
    }
    return CardStatusCollection.fromCardStatuses(cardStatuses)
  }

  private cardVersions: Record<Card['hash'], CardVersion> = {}

  private async loadCardVersion(): Promise<void> {
    const cardVersions: CardVersion[] = await asTransaction(async (queries) => queries.getLatestCardVersions(this.cardHashes))
    cardVersions.forEach((cardVersion) => {
      this.cardVersions[cardVersion.card] = cardVersion
    })
  }
}
