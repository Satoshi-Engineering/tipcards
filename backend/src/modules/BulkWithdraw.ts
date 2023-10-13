import type { BulkWithdraw as BulkWithdrawRedis } from '../../../src/data/redis/BulkWithdraw'
import type { Card as CardRedis } from '../../../src/data/redis/Card'

import CardNotFundedError from '../errors/CardNotFundedError'
import CardWithdrawnError from '../errors/CardWithdrawnError'
import CardCollection from './CardCollection'
import { updateCard, createBulkWithdraw } from '../services/database'
import hashSha256 from '../services/hashSha256'
import { deleteWithdrawIfNotUsed, createWithdrawLink } from '../services/lnbitsHelpers'
import { bulkWithdrawFromBulkWithdrawRedis } from '../trpc/data/transforms/bulkWithdrawFromBulkWithdrawRedis'
import { TIPCARDS_API_ORIGIN } from '../constants'

export default class BulkWithdraw {
  static fromCardCollection(cards: CardCollection) {
    return new BulkWithdraw(cards.getCards())
  }

  /**
   * @throws CardNotFundedError
   * @throws CardWithdrawnError
   * @throws WithdrawAlreadyUsedError
   * @throws AxiosError
   * @throws unknown
   */
  async create() {
    const amount = this.getFundedAmountForCollection()
    await this.lockAllCards()
    await this.removeLnbitsWithdrawsFromCollection()
    await this.createBulkWithdraw(amount)
  }

  async toTRpcResponse() {
    if (this.bulkWithdrawRedis === undefined) {
      throw new Error('BulkWithdraw not created yet, call create first!')
    }
    return await bulkWithdrawFromBulkWithdrawRedis(this.bulkWithdrawRedis)
  }

  private readonly cards: CardRedis[]
  private bulkWithdrawRedis: BulkWithdrawRedis | undefined = undefined
  private constructor(cards: CardRedis[]) {
    this.cards = cards
  }

  /**
   * @throws CardNotFundedError
   * @throws CardWithdrawnError
   */
  private getFundedAmountForCollection() {
    return this.cards.reduce((total, card) => {
      if (card.used) {
        throw new CardWithdrawnError(`Card ${card.cardHash} is already withdrawn.`)
      }
      return total + this.getFundedAmountForCard(card)
    }, 0)
  }

  /**
   * @throws CardNotFundedError
   */
  private getFundedAmountForCard(card: CardRedis) {
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
   * @throws unknown
   */
  private async lockAllCards() {
    await Promise.all(this.cards.map(async (card) => {
      card.isLockedByBulkWithdraw = true
      await updateCard(card)
    }))
  }

  private async removeLnbitsWithdrawsFromCollection() {
    await Promise.all(this.cards.map(async (card) => await this.removeLnbitsWithdrawFromCard(card)))
  }

  /**
   * @throws WithdrawAlreadyUsedError
   * @throws AxiosError
   */
  private async removeLnbitsWithdrawFromCard(card: CardRedis) {
    if (card.lnbitsWithdrawId == null) {
      return
    }
    await deleteWithdrawIfNotUsed(card.lnbitsWithdrawId, card.text, `${TIPCARDS_API_ORIGIN}/api/withdraw/used/${card.cardHash}`)
    card.lnbitsWithdrawId = null
    await updateCard(card)
  }

  private createBulkWithdrawIdForCollection() {
    return hashSha256(this.cards.map((card) => card.cardHash).join(''))
  }

  private async createBulkWithdraw(amount: number) {
    const id = this.createBulkWithdrawIdForCollection()
    const { lnbitsWithdrawId, lnbitsWithdrawLnurl } = await this.createLnbitsWithdrawLink({ id, amount })
    await this.createBulkWithdrawRedis({
      id,
      amount,
      lnbitsWithdrawId,
      lnbitsWithdrawLnurl
    }) 
  }

  private async createLnbitsWithdrawLink({
    id,
    amount,
  }: {
    id: string,
    amount: number,
  }) {
    return await createWithdrawLink(
      `Bulk withdrawing ${this.cards.length} cards.`,
      amount,
      `${TIPCARDS_API_ORIGIN}/api/bulk-withdraw/withdrawn/${id}`,
    )
  }

  private async createBulkWithdrawRedis({
    id,
    amount,
    lnbitsWithdrawId,
    lnbitsWithdrawLnurl,
  }: {
    id: string,
    amount: number,
    lnbitsWithdrawId: string,
    lnbitsWithdrawLnurl: string,
  }) {
    this.bulkWithdrawRedis = {
      id,
      created: new Date(),
      amount,
      cards: this.cards.map((card) => card.cardHash),
      lnbitsWithdrawId,
      lnurl: lnbitsWithdrawLnurl,
      withdrawn: null,
    }
    await createBulkWithdraw(this.bulkWithdrawRedis)
  }
}
