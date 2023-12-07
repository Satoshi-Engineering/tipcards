import type z from 'zod'

import type { BulkWithdraw as BulkWithdrawRedis } from '@backend/database/redis/data/BulkWithdraw'
import type { Card as CardRedis } from '@backend/database/redis/data/Card'
import NotFoundError from '@backend/errors/NotFoundError'
import WithdrawAlreadyUsedError from '@backend/errors/WithdrawAlreadyUsedError'
import {
  createBulkWithdraw,
  getAllBulkWithdraws, getBulkWithdrawById,
  updateBulkWithdraw, deleteBulkWithdraw,
} from '@backend/database/queries'
import hashSha256 from '@backend/services/hashSha256'
import { deleteWithdrawIfNotUsed, createWithdrawLink } from '@backend/services/lnbitsHelpers'
import { bulkWithdrawFromBulkWithdrawRedis } from '@backend/trpc/data/transforms/bulkWithdrawFromBulkWithdrawRedis'
import { TIPCARDS_API_ORIGIN } from '@backend/constants'

import CardCollection from './CardCollection'

type BulkWithdrawId = z.infer<typeof BulkWithdrawRedis.shape.id>
type CardHash = z.infer<typeof CardRedis.shape.cardHash>

export default class BulkWithdraw {
  static fromCardCollection(cards: CardCollection) {
    return new BulkWithdraw(cards)
  }

  /**
   * @throws NotFoundError
   * @throws unknown
   */
  static async fromId(id: BulkWithdrawId) {
    const bulkWithdrawRedis = await getBulkWithdrawById(id)
    return await BulkWithdraw.fromBulkWithdrawRedis(bulkWithdrawRedis)
  }

  /**
   * @throws NotFoundError
   * @throws unknown
   */
  static async fromCardHash(cardHash: CardHash) {
    const bulkWithdrawRedis = await BulkWithdraw.getBulkWithdrawRedisFromCardHash(cardHash)
    return await BulkWithdraw.fromBulkWithdrawRedis(bulkWithdrawRedis)
  }

  static async fromBulkWithdrawRedis(bulkWithdrawRedis: BulkWithdrawRedis) {
    const cards = await CardCollection.fromCardHashes(bulkWithdrawRedis.cards)
    const bulkWithdraw = new BulkWithdraw(cards)
    bulkWithdraw.bulkWithdrawRedis = bulkWithdrawRedis
    return bulkWithdraw
  }

  /**
   * @throws CardNotFundedError
   * @throws CardWithdrawnError
   * @throws WithdrawAlreadyUsedError
   * @throws AxiosError
   * @throws unknown
   */
  async create() {
    const amount = this.cards.getFundedAmount()
    await this.cards.lockByBulkWithdraw()
    await this.cards.removeLnbitsWithdrawLinks()
    await this.createBulkWithdraw(amount)
  }

  /**
   * @throws WithdrawAlreadyUsedError
   * @throws AxiosError
   */
  async delete() {
    await this.removeLnbitsWithdraw()
    await this.cards.releaseBulkWithdrawLock()
    await deleteBulkWithdraw(this.bulkWithdrawRedis)
  }

  async toTRpcResponse() {
    return await bulkWithdrawFromBulkWithdrawRedis(this.bulkWithdrawRedis)
  }

  /**
   * @throws NotFoundError
   * @throws unknown
   */
  private static async getBulkWithdrawRedisFromCardHash(cardHash: CardHash) {
    const bulkWithdrawsRedis = await getAllBulkWithdraws()
    const bulkWithdrawRedis = bulkWithdrawsRedis.find((bulkWithdraw) => bulkWithdraw.cards.includes(cardHash))
    if (bulkWithdrawRedis == null) {
      throw new NotFoundError(`No BulkWithdraw found for card ${cardHash}.`)
    }
    return bulkWithdrawRedis
  }

  public readonly cards: CardCollection
  private _bulkWithdrawRedis: BulkWithdrawRedis | undefined = undefined
  private constructor(cards: CardCollection) {
    this.cards = cards
  }

  private get bulkWithdrawRedis() {
    if (this._bulkWithdrawRedis === undefined) {
      throw new Error('BulkWithdraw not initialized, call create first!')
    }
    return this._bulkWithdrawRedis
  }

  private set bulkWithdrawRedis(bulkWithdrawRedis: BulkWithdrawRedis) {
    this._bulkWithdrawRedis = bulkWithdrawRedis
  }

  private createBulkWithdrawIdForCollection() {
    return hashSha256(this.cards.cardHashes.join(''))
  }

  private async createBulkWithdraw(amount: number) {
    const id = this.createBulkWithdrawIdForCollection()
    const { lnbitsWithdrawId } = await this.createLnbitsWithdrawLink({ id, amount })
    await this.createBulkWithdrawRedis({
      id,
      amount,
      lnbitsWithdrawId,
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
      `Bulk withdrawing ${this.cards.length} card(s).`,
      amount,
      `${TIPCARDS_API_ORIGIN}/api/bulkWithdraw/withdrawn/${id}`,
    )
  }

  private async createBulkWithdrawRedis({
    id,
    amount,
    lnbitsWithdrawId,
  }: {
    id: string,
    amount: number,
    lnbitsWithdrawId: string,
  }) {
    this.bulkWithdrawRedis = {
      id,
      created: Math.round(+ new Date() / 1000),
      amount,
      cards: this.cards.cardHashes,
      lnbitsWithdrawId,
      lnbitsWithdrawDeleted: null,
      withdrawn: null,
    }
    await createBulkWithdraw(this.bulkWithdrawRedis)
  }

  /**
   * @throws WithdrawAlreadyUsedError
   * @throws AxiosError
   * @throws unknown
   */
  private async removeLnbitsWithdraw() {
    if (this.bulkWithdrawRedis.withdrawn != null) {
      throw new WithdrawAlreadyUsedError(`BulkWithdraw ${this.bulkWithdrawRedis.id} is already withdrawn.`)
    }
    if (this.bulkWithdrawRedis.lnbitsWithdrawId == null) {
      return
    }
    await deleteWithdrawIfNotUsed(
      this.bulkWithdrawRedis.lnbitsWithdrawId,
      `Bulk withdrawing ${this.cards.length} cards.`,
      `${TIPCARDS_API_ORIGIN}/api/bulkWithdraw/withdrawn/${this.bulkWithdrawRedis.id}`,
    )
    this.bulkWithdrawRedis.lnbitsWithdrawDeleted = Math.round(+ new Date() / 1000)
    await updateBulkWithdraw(this.bulkWithdrawRedis)
  }
}
