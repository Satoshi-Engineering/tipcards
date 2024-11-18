import { CardStatusEnum, fundedStatuses, pendingStatuses, withdrawnStatuses } from '@shared/data/trpc/CardStatusDto.js'
import { CardsSummaryCategoriesEnum, CardsSummaryDto } from '@shared/data/trpc/CardsSummaryDto.js'
import CardStatus from './CardStatus.js'

export default class CardsSummary {
  public static toTRpcResponse(cardStatuses: CardStatus[]): CardsSummaryDto {
    return new CardsSummary(cardStatuses).toTRpcResponse()
  }

  private cardStatuses: CardStatus[]

  private toTRpcResponse(): CardsSummaryDto {
    const unfunded = this.getCountAndAmountByStatusCategory(CardsSummaryCategoriesEnum.enum.unfunded)
    const pending = this.getCountAndAmountByStatusCategory(CardsSummaryCategoriesEnum.enum.pending)
    const funded = this.getCountAndAmountByStatusCategory(CardsSummaryCategoriesEnum.enum.funded)
    const withdrawn = this.getCountAndAmountByStatusCategory(CardsSummaryCategoriesEnum.enum.withdrawn)
    return {
      [CardsSummaryCategoriesEnum.enum.unfunded]: unfunded,
      [CardsSummaryCategoriesEnum.enum.pending]: pending,
      [CardsSummaryCategoriesEnum.enum.funded]: funded,
      [CardsSummaryCategoriesEnum.enum.withdrawn]: withdrawn,
    }
  }

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
        return fundedStatuses.includes(status)
      case CardsSummaryCategoriesEnum.enum.withdrawn:
        return withdrawnStatuses.includes(status)
    }
  }
}
