import CardStatus from './CardStatus.js'
import CardStatusBuilder from './CardStatusBuilder.js'
import CardsSummary from './CardsSummary.js'

export default class CardStatusCollection {
  public static async fromCardHashes(cardHashes: string[]): Promise<CardStatusCollection> {
    const builder = new CardStatusBuilder(cardHashes)
    await builder.build()
    return builder.getCardStatusCollection()
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
