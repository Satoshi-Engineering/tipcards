import type { Card as CardRedis } from '../../../src/data/Card'
import type { Set as SetRedis } from '../../../src/data/Set'

import { getSetById, getCardByHash } from '../services/database'
import hashSha256 from '../services/hashSha256'
import { CardFromCardDatabase } from '../trpc/data/transforms/CardFromCardDatabase'

export default class CardCollectionRedis {
  /**
   * @throws database error
   */
  static async fromSetId(setId: string) {
    const set = await getSetById(setId)
    if (set == null) {
      return new CardCollectionRedis([])
    }
    const collection = new CardCollectionRedis(CardCollectionRedis.getCardHashesForSet(set))
    await collection.loadCards()
    return collection
  }

  /**
   * @throws ZodError
   * @throws ErrorWithCode
   */
  async toTRpcResponse() {
    return Promise.all(this.cards.map((card) => CardFromCardDatabase.parseAsync(card)))
  }

  private readonly cardHashes: string[]
  private cards: CardRedis[]
  private constructor(cardHashes: string[]) {
    this.cardHashes = cardHashes
    this.cards = []
  }

  private async loadCards() {
    const cards = await Promise.all(this.cardHashes.map((cardHash) => getCardByHash(cardHash)))
    this.cards = cards.filter((card) => card != null) as CardRedis[]
  }

  private static getCardHashesForSet(set: SetRedis) {
    return [...new Array(set.settings?.numberOfCards || 8).keys()].map((cardIndex) => hashSha256(`${set.id}/${cardIndex}`))
  }
}
