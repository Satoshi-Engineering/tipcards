import { SetDto } from '@shared/data/trpc/tipcards/SetDto.js'
import { SetStatisticsDto, SetStatisticsCategoriesEnum } from '@shared/data/trpc/tipcards/SetStatisticsDto.js'

import { asTransaction } from '@backend/database/client.js'
import { CardStatusEnum, pendingStatuses, withdrawnStatuses } from '@shared/data/trpc/tipcards/CardStatusDto.js'
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

  public async getStatisticsById(): Promise<SetStatisticsDto> {
    const cardHashes = this.getAllCardHashes()
    const cardStatuses = await Promise.all(
      cardHashes.map(async (hash) => await CardStatus.latestFromCardHashOrDefault(hash)),
    )
    const statistics: SetStatisticsDto = {
      [SetStatisticsCategoriesEnum.enum.unfunded]: cardStatuses.filter(
        ({ status }) => status=== CardStatusEnum.enum.unfunded,
      ).length,
      [SetStatisticsCategoriesEnum.enum.pending]: cardStatuses.filter(
        ({ status }) => pendingStatuses.includes(status),
      ).length,
      [SetStatisticsCategoriesEnum.enum.funded]: cardStatuses.filter(
        ({ status }) => status === CardStatusEnum.enum.funded,
      ).length,
      [SetStatisticsCategoriesEnum.enum.withdrawn]: cardStatuses.filter(
        ({ status }) => withdrawnStatuses.includes(status),
      ).length,
    }
    return statistics
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
