import { CardStatusForHistoryDto } from '@shared/data/trpc/CardStatusForHistoryDto.js'

import Collection from './Collection.js'
import CardStatusForHistory from './CardStatusForHistory.js'
import CardStatusForHistoryBuilder from './CardStatusForHistoryBuilder.js'

export default class CardStatusForHistoryCollection extends Collection<CardStatusForHistory> {
  public static async fromCardHashes(cardHashes: string[]): Promise<CardStatusForHistoryCollection> {
    const builder = new CardStatusForHistoryBuilder(cardHashes)
    await builder.build()
    return new CardStatusForHistoryCollection(builder.cardStatuses)
  }

  public constructor(cardStatuses: CardStatusForHistory[]) {
    super(cardStatuses)
  }

  public toTrpcResponse(): {
    data: CardStatusForHistoryDto[],
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
