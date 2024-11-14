import { CardStatusEnum, pendingStatuses, withdrawnStatuses } from '@shared/data/trpc/CardStatusDto.js'
import { CardsSummaryCategoriesEnum, CardsSummaryDto } from '@shared/data/trpc/CardsSummaryDto.js'
import CardStatus from './CardStatus.js'

export default class CardsSummary {
  public static fromCardStatuses(cardStatuses: CardStatus[]): CardsSummary {
    return new CardsSummary(cardStatuses)
  }

  public getSummary(): CardsSummaryDto {
    const unfunded = this.getCountAndAmountByStatusCategory('unfunded')
    const pending = this.getCountAndAmountByStatusCategory('pending')
    const funded = this.getCountAndAmountByStatusCategory('funded')
    const withdrawn = this.getCountAndAmountByStatusCategory('withdrawn')
    return {
      [CardsSummaryCategoriesEnum.enum.unfunded]: unfunded,
      [CardsSummaryCategoriesEnum.enum.pending]: pending,
      [CardsSummaryCategoriesEnum.enum.funded]: funded,
      [CardsSummaryCategoriesEnum.enum.withdrawn]: withdrawn,
    }
  }

  private cardStatuses: CardStatus[]

  private constructor(cardStatuses: CardStatus[]) {
    this.cardStatuses = cardStatuses
  }

  private getCountAndAmountByStatusCategory(statusCategory: CardsSummaryCategoriesEnum): { count: number, amount: number } {
    const filteredCardStatuses = this.cardStatuses.filter(
      ({ status }) => CardsSummary.statusMatchesStatusCategory(status, statusCategory),
    )
    const count = filteredCardStatuses.length
    const amount = filteredCardStatuses.reduce((sum, { amount }) => sum + (amount ?? 0), 0)
    return { count, amount }
  }

  private static statusMatchesStatusCategory(status: CardStatusEnum, statusCategory: CardsSummaryCategoriesEnum): boolean {
    switch (statusCategory) {
      case CardsSummaryCategoriesEnum.enum.unfunded:
        return status === CardStatusEnum.enum.unfunded
      case CardsSummaryCategoriesEnum.enum.pending:
        return pendingStatuses.includes(status)
      case CardsSummaryCategoriesEnum.enum.funded:
        return status === CardStatusEnum.enum.funded
      case CardsSummaryCategoriesEnum.enum.withdrawn:
        return withdrawnStatuses.includes(status)
    }
  }
}
