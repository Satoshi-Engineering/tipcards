import { CardStatusDto } from '@shared/data/trpc/CardStatusDto.js'

import CardStatus from './CardStatus.js'
import CardStatusBuilder from './CardStatusBuilder.js'
import CardsSummary from './CardsSummary.js'
import Collection from './Collection.js'

export default class CardStatusCollection extends Collection<CardStatus> {
  public static async fromCardHashes(cardHashes: string[]): Promise<CardStatusCollection> {
    const builder = new CardStatusBuilder(cardHashes)
    await builder.build()
    return new CardStatusCollection(builder.cardStatuses)
  }

  public constructor(cardStatuses: CardStatus[]) {
    super(cardStatuses)
  }

  public get summary(): CardsSummary {
    return CardsSummary.fromCardStatuses(this.data)
  }

  public toTrpcResponse(): {
    data: CardStatusDto[],
    totalUnfiltered: number,
    pagination?: { offset: number, limit: number, total: number },
    } {
    if (this.pagination.limit > 0) {
      return {
        data: this.paginated.map((cardStatus) => cardStatus.toTrpcResponse()),
        totalUnfiltered: this.data.length,
        pagination: {
          offset: this.pagination.offset,
          limit: this.pagination.limit,
          total: this.filteredAndSorted.length,
        },
      }
    }

    return {
      data: this.filteredAndSorted.map((cardStatus) => cardStatus.toTrpcResponse()),
      totalUnfiltered: this.data.length,
    }
  }
}
