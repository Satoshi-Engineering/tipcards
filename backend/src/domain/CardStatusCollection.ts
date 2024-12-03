import CardStatus from './CardStatus.js'
import CardStatusBuilder from './CardStatusBuilder.js'
import CardsSummary from './CardsSummary.js'

export default class CardStatusCollection<T extends CardStatus = CardStatus> {
  public static async fromCardHashes(cardHashes: string[]): Promise<CardStatusCollection> {
    const builder = new CardStatusBuilder(cardHashes)
    await builder.build()
    return builder.getCardStatusCollection()
  }

  public readonly cardStatuses: T[]

  public constructor(cardStatuses: T[]) {
    this.cardStatuses = cardStatuses
  }

  public get summary(): CardsSummary {
    return CardsSummary.fromCardStatuses(this.cardStatuses)
  }
}
