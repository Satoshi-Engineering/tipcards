import assert from 'node:assert'

import CardStatus from './CardStatus.js'
import CardStatusBuilder from './CardStatusBuilder.js'
import CardsSummary from './CardsSummary.js'

export default class CardStatusCollection {
  public static async fromCardHashes(cardHashes: string[]): Promise<CardStatusCollection> {
    const builder = new CardStatusBuilder(cardHashes)
    await builder.build()
    const cardStatuses = builder.getResult()

    assert(cardStatuses instanceof CardStatusCollection, `Using CardStatusBuilder for ${cardHashes.join(', ')} did not return a CardStatusCollection`)
    return cardStatuses
  }

  public static fromCardStatuses(cardStatuses: CardStatus[]): CardStatusCollection {
    return new CardStatusCollection(cardStatuses)
  }

  public readonly cardStatuses: CardStatus[]

  public get summary(): CardsSummary {
    return CardsSummary.fromCardStatuses(this.cardStatuses)
  }

  private constructor(cardStatuses: CardStatus[]) {
    this.cardStatuses = cardStatuses
  }
}
