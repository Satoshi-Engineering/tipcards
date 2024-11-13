import CardStatus from './CardStatus.js'

export default class CardStatusCollection {
  public static async fromCardHashes(cardHashes: string[]): Promise<CardStatusCollection> {
    const instance = new CardStatusCollection(cardHashes)
    await instance.loadCardStatuses()
    return instance
  }

  public get cardStatuses(): CardStatus[] {
    if (this.cardStatusesInternal == null) {
      throw new Error('CardStatusCollection not loaded')
    }
    return this.cardStatusesInternal
  }

  private cardHashes: string[]
  private cardStatusesInternal?: CardStatus[]

  private constructor(cardHashes: string[]) {
    this.cardHashes = cardHashes
  }

  private async loadCardStatuses() {
    this.cardStatusesInternal = await Promise.all(
      this.cardHashes.map(async (hash) => await CardStatus.latestFromCardHashOrDefault(hash)),
    )
  }
}
