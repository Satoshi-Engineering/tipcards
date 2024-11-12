import { SetDto } from '@shared/data/trpc/SetDto.js'
import { CardsSummaryDto, CardsSummaryCategoriesEnum } from '@shared/data/trpc/CardsSummaryDto.js'

import { asTransaction } from '@backend/database/client.js'
import { CardStatusEnum, pendingStatuses, withdrawnStatuses } from '@shared/data/trpc/CardStatusDto.js'
import CardStatus from './CardStatus.js'
import hashSha256 from '@backend/services/hashSha256.js'

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
    const cardStatuses = await Promise.all(
      cardHashes.map(async (hash) => await CardStatus.latestFromCardHashOrDefault(hash)),
    )
    const cardsSummary: CardsSummaryDto = {
      [CardsSummaryCategoriesEnum.enum.unfunded]: cardStatuses.filter(
        ({ status }) => status=== CardStatusEnum.enum.unfunded,
      ).length,
      [CardsSummaryCategoriesEnum.enum.pending]: cardStatuses.filter(
        ({ status }) => pendingStatuses.includes(status),
      ).length,
      [CardsSummaryCategoriesEnum.enum.funded]: cardStatuses.filter(
        ({ status }) => status === CardStatusEnum.enum.funded,
      ).length,
      [CardsSummaryCategoriesEnum.enum.withdrawn]: cardStatuses.filter(
        ({ status }) => withdrawnStatuses.includes(status),
      ).length,
    }
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
