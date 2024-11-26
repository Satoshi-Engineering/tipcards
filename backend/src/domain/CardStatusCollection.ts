import CardStatus from './CardStatus.js'
import CardsSummary from './CardsSummary.js'

export default class CardStatusCollection {
  public static async fromCardHashes(cardHashes: string[]): Promise<CardStatusCollection> {
    const cardStatuses = await CardStatusCollection.loadCardStatuses(cardHashes)
    return new CardStatusCollection(cardStatuses)
  }

  public readonly cardStatuses: CardStatus[]

  public get summary(): CardsSummary {
    return CardsSummary.fromCardStatuses(this.cardStatuses)
  }

  private constructor(cardStatuses: CardStatus[]) {
    this.cardStatuses = cardStatuses
  }

  private static async loadCardStatuses(cardHashes: string[]): Promise<CardStatus[]> {
    return await Promise.all(
      cardHashes.map(async (hash) => await CardStatus.latestFromCardHashOrDefault(hash)),
    )
  }
}
