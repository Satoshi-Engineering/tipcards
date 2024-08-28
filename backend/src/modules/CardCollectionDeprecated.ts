import type z from 'zod'

import type { Card as CardRedis } from '@backend/database/deprecated/data/Card.js'
import type { Set as SetRedis } from '@backend/database/deprecated/data/Set.js'
import CardNotFundedError from '@backend/errors/CardNotFundedError.js'
import CardWithdrawnError from '@backend/errors/CardWithdrawnError.js'
import NotFoundError from '@backend/errors/NotFoundError.js'
import {
  getSetById,
  getCardByHash, updateCard,
} from '@backend/database/deprecated/queries.js'
import hashSha256 from '@backend/services/hashSha256.js'
import { deleteWithdrawIfNotUsed } from '@backend/services/lnbitsHelpers.js'
import { cardFromCardRedis } from '@backend/trpc/data/transforms/cardFromCardRedis.js'
import { TIPCARDS_API_ORIGIN } from '@backend/constants.js'

type CardHash = z.infer<typeof CardRedis.shape.cardHash>
type SetId = z.infer<typeof SetRedis.shape.id>

/**
 * deprecated as it still uses deprecated (redis) queries
 * @deprecated
 */
export default class CardCollectionDeprecated {
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
    const cardHashes = CardCollectionDeprecated.getCardHashesForSet(set)
    const cards = await CardCollectionDeprecated.loadExistingCards(cardHashes)
    return new CardCollectionDeprecated(cards)
  }

  /**
   * @throws NotFoundError
   * @throws ZodError
   * @throws unkown
   */
  static async fromCardHashes(cardHashes: CardHash[]) {
    const cards = await CardCollectionDeprecated.loadCards(cardHashes)
    const collection = new CardCollectionDeprecated(cards)
    return collection
  }

  public get length() {
    return this.cards.length
  }

  public get cardHashes() {
    return this.cards.map((card) => card.cardHash)
  }

  /**
   * @throws CardNotFundedError
   * @throws CardWithdrawnError
   */
  public getFundedAmount() {
    return this.cards.reduce((total, card) => total + this.getFundedAmountForCard(card), 0)
  }

  /**
   * @throws unknown
   */
  public async lockByBulkWithdraw() {
    await Promise.all(this.cards.map(async (card) => {
      card.isLockedByBulkWithdraw = true
      await updateCard(card)
    }))
  }

  /**
   * @throws unknown
   */
  public async releaseBulkWithdrawLock() {
    await Promise.all(this.cards.map(async (card) => {
      card.isLockedByBulkWithdraw = false
      await updateCard(card)
    }))
  }

  /**
   * @throws WithdrawAlreadyUsedError
   * @throws AxiosError
   */
  public async removeLnbitsWithdrawLinks() {
    await Promise.all(this.cards.map(async (card) => await this.removeLnbitsWithdrawLinkFromCard(card)))
  }

  /**
   * @throws ZodError
   * @throws ErrorWithCode
   */
  async toTRpcResponse() {
    return Promise.all(this.cards.map((card) => cardFromCardRedis(card)))
  }

  /**
   * @throws NotFoundError
   * @throws ZodError
   * @throws unkown
   */
  private static async loadCards(cardHashes: CardHash[]) {
    return await Promise.all(cardHashes.map(async (cardHash) => {
      const card = await getCardByHash(cardHash)
      if (card == null) {
        throw new NotFoundError(`Card ${cardHash} not found.`)
      }
      return card
    }))
  }

  /**
   * @throws ZodError
   * @throws unkown
   */
  private static async loadExistingCards(cardHashes: CardHash[]) {
    const cards = await Promise.all(cardHashes.map((cardHash) => getCardByHash(cardHash)))
    return cards.filter((card) => card != null) as CardRedis[]
  }

  private static getCardHashesForSet(set: SetRedis) {
    return [...new Array(set.settings?.numberOfCards || 8).keys()].map((cardIndex) => hashSha256(`${set.id}/${cardIndex}`))
  }

  public readonly cards: CardRedis[]
  private constructor(cards: CardRedis[]) {
    this.cards = cards
  }

  /**
   * @throws CardNotFundedError
   * @throws CardWithdrawnError
   */
  private getFundedAmountForCard(card: CardRedis) {
    if (card.used) {
      throw new CardWithdrawnError(`Card ${card.cardHash} is already withdrawn.`)
    }
    let amount: number | null = null
    if (card.invoice?.paid != null) {
      amount = card.invoice.amount
    } else if (card.lnurlp?.paid != null && card.lnurlp.amount != null) {
      amount = card.lnurlp.amount
    } else if (card.setFunding?.paid != null) {
      amount = card.setFunding.amount
    }
    if (amount == null) {
      throw new CardNotFundedError(`Card ${card.cardHash} is not funded.`)
    }
    return amount
  }

  /**
   * @throws WithdrawAlreadyUsedError
   * @throws AxiosError
   */
  private async removeLnbitsWithdrawLinkFromCard(card: CardRedis) {
    if (card.lnbitsWithdrawId == null) {
      return
    }
    await deleteWithdrawIfNotUsed(
      card.lnbitsWithdrawId,
      card.text,
      `${TIPCARDS_API_ORIGIN}/api/withdraw/used/${card.cardHash}`,
    )
    card.lnbitsWithdrawId = null
    await updateCard(card)
  }
}
