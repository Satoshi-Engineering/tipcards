import type z from 'zod'

import type { Card as CardRedis } from '@backend/database/deprecated/data/Card.js'
import { getCardByHash, updateCard } from '@backend/database/deprecated/queries.js'
import NotFoundError from '@backend/errors/NotFoundError.js'
import { cardFromCardRedis } from '@backend/trpc/data/transforms/cardFromCardRedis.js'

type CardHash = z.infer<typeof CardRedis.shape.cardHash>

/**
 * deprecated as it still uses deprecated (redis) queries
 * @deprecated
 */
export default class CardDeprecated {
  /**
   * @throws ZodError
   * @throws unknown
   */
  public static async fromCardHash(cardHash: CardHash) {
    const cardRedis = await getCardByHash(cardHash)
    if (cardRedis == null) {
      throw new NotFoundError(`Card with hash ${cardHash} not found`)
    }
    return new CardDeprecated(cardRedis)
  }

  /**
   * @throws ZodError
   * @throws unknown
   */
  public static async fromCardHashOrDefault(cardHash: CardHash) {
    const cardRedis = await getCardByHash(cardHash)
    if (cardRedis == null) {
      return new CardDeprecated(CardDeprecated.initCardRedisFromHash(cardHash))
    }
    return new CardDeprecated(cardRedis)
  }

  /**
   * @throws ZodError
   * @throws ErrorWithCode
   */
  public async toTRpcResponse() {
    return await cardFromCardRedis(this.cardRedis)
  }

  public async setLandingPageViewed() {
    if (this.cardRedis.landingPageViewed != null) {
      return
    }
    this.cardRedis.landingPageViewed = Math.round(+ new Date() / 1000)
    await updateCard(this.cardRedis)
  }

  private readonly cardRedis: CardRedis
  private constructor(cardRedis: CardRedis) {
    this.cardRedis = cardRedis
  }

  private static initCardRedisFromHash(cardHash: CardHash): CardRedis {
    return {
      cardHash: cardHash,
      text: '',
      note: '',
      invoice: null,
      lnurlp: null,
      setFunding: null,
      lnbitsWithdrawId: null,
      landingPageViewed: null,
      isLockedByBulkWithdraw: false,
      used: null,
    }
  }
}
