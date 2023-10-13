import z from 'zod'

import { Card as ZodCardRedis, type Card as CardRedis } from '../../../src/data/redis/Card'
import { Set as ZodSetRedis, type Set as SetRedis } from '../../../src/data/redis/Set'

import NotFoundError from '../errors/NotFoundError'
import { getSetById, getCardByHash } from '../services/database'
import hashSha256 from '../services/hashSha256'
import { cardFromCardRedis } from '../trpc/data/transforms/cardFromCardRedis'

type CardHash = z.infer<typeof ZodCardRedis.shape.cardHash>
type SetId = z.infer<typeof ZodSetRedis.shape.id>

export default class CardCollection {
  /**
   * @throws NotFoundError
   * @throws ZodError
   * @throws unkown
   */
  static async fromSetId(setId: SetId) {
    const set = await getSetById(setId)
    if (set == null) {
      throw new NotFoundError(`Set ${setId} not found.`)
    }
    const collection = new CardCollection(CardCollection.getCardHashesForSet(set))
    await collection.loadExistingCards()
    return collection
  }

  /**
   * @throws NotFoundError
   * @throws ZodError
   * @throws unkown
   */
  static async fromCardHashes(cardHashes: CardHash[]) {
    const collection = new CardCollection(cardHashes)
    await collection.loadCards()
    return collection
  }

  getCards() {
    return this.cards
  }

  /**
   * @throws ZodError
   * @throws ErrorWithCode
   */
  async toTRpcResponse() {
    return Promise.all(this.cards.map((card) => cardFromCardRedis(card)))
  }

  private readonly cardHashes: CardHash[]
  private cards: CardRedis[]
  private constructor(cardHashes: CardHash[]) {
    this.cardHashes = cardHashes
    this.cards = []
  }

  /**
   * @throws ZodError
   * @throws unkown
   */
  private async loadExistingCards() {
    const cards = await Promise.all(this.cardHashes.map((cardHash) => getCardByHash(cardHash)))
    this.cards = cards.filter((card) => card != null) as CardRedis[]
  }

  /**
   * @throws NotFoundError
   * @throws ZodError
   * @throws unkown
   */
  private async loadCards() {
    this.cards = await Promise.all(this.cardHashes.map(async (cardHash) => {
      const card = await getCardByHash(cardHash)
      if (card == null) {
        throw new NotFoundError(`Card ${cardHash} not found.`)
      }
      return card
    }))
  }

  private static getCardHashesForSet(set: SetRedis) {
    return [...new Array(set.settings?.numberOfCards || 8).keys()].map((cardIndex) => hashSha256(`${set.id}/${cardIndex}`))
  }
}
