import { SetDto } from '@shared/data/trpc/SetDto.js'
import { CardsSummaryDto } from '@shared/data/trpc/CardsSummaryDto.js'

import { asTransaction } from '@backend/database/client.js'
import hashSha256 from '@backend/services/hashSha256.js'
import CardStatusCollection from './CardStatusCollection.js'
import CardsSummary from './CardsSummary.js'

export default class Set {
  public static async fromId(setId: SetDto['id']): Promise<Set> {
    const set = await asTransaction(
      async (queries) => await queries.getSetById(setId),
    )
    const settings = await asTransaction(
      async (queries) => await queries.getSetSettingsBySetId(setId),
    )
    const setWithSettings = SetDto.parse({
      ...set,
      settings,
    })
    return new Set(setWithSettings)
  }

  public async getCardsSummary(): Promise<CardsSummaryDto> {
    const cardHashes = this.getAllCardHashes()
    const cardStatusCollection = await CardStatusCollection.fromCardHashes(cardHashes)
    const cardsSummary: CardsSummaryDto = CardsSummary.toTRpcResponse(cardStatusCollection.cardStatuses)
    return cardsSummary
  }

  public getAllCardHashes(): string[] {
    return [...Array(this.set.settings.numberOfCards).keys()].map((cardIndex) => this.getCardHash(cardIndex))
  }

  public getCardHash(cardIndex: number): string {
    return hashSha256(`${this.set.id}/${cardIndex}`)
  }

  public readonly set: SetDto
  private constructor(set: SetDto) {
    this.set = set
  }
}
