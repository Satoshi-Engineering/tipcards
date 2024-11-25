import { CardStatusEnum, userActionRequired, fundedStatuses, unfundedStatuses, withdrawnStatuses } from '@shared/data/trpc/CardStatusDto.js'
import { CardsSummaryCategoriesEnum, CardsSummaryDto } from '@shared/data/trpc/CardsSummaryDto.js'
import CardStatus from './CardStatus.js'

export default class CardsSummary {
  public static toTRpcResponse(cardStatuses: CardStatus[]): CardsSummaryDto {
    return new CardsSummary(cardStatuses).toTRpcResponse()
  }

  private cardStatuses: CardStatus[]

  private toTRpcResponse(): CardsSummaryDto {
    const userActionRequired = this.getCountAndAmountByStatusCategory(CardsSummaryCategoriesEnum.enum.userActionRequired)
    const unfunded = this.getCountAndAmountByStatusCategory(CardsSummaryCategoriesEnum.enum.unfunded)
    const funded = this.getCountAndAmountByStatusCategory(CardsSummaryCategoriesEnum.enum.funded)
    const withdrawn = this.getCountAndAmountByStatusCategory(CardsSummaryCategoriesEnum.enum.withdrawn)
    return {
      [CardsSummaryCategoriesEnum.enum.userActionRequired]: userActionRequired,
      [CardsSummaryCategoriesEnum.enum.unfunded]: unfunded,
      [CardsSummaryCategoriesEnum.enum.funded]: funded,
      [CardsSummaryCategoriesEnum.enum.withdrawn]: withdrawn,
    }
  }

  private constructor(cardStatuses: CardStatus[]) {
    this.cardStatuses = cardStatuses
  }

  private getCountAndAmountByStatusCategory(statusCategory: CardsSummaryCategoriesEnum): { count: number, amount: number } {
    const filteredCardStatuses = this.cardStatuses.filter(
      ({ status }) => CardsSummary.getStatusCategoryForCardStatus(status) === statusCategory,
    )
    const count = filteredCardStatuses.length
    const amount = filteredCardStatuses.reduce((sum, { amount }) => sum + (amount ?? 0), 0)
    return { count, amount }
  }

  private static getStatusCategoryForCardStatus(status: CardStatusEnum): CardsSummaryCategoriesEnum {
    // this status is greedy and includes all statuses that require user action,
    // even if the cardStatus would be in another category as well
    if (userActionRequired.includes(status)) {
      return CardsSummaryCategoriesEnum.enum.userActionRequired
    }

    if (unfundedStatuses.includes(status)) {
      return CardsSummaryCategoriesEnum.enum.unfunded
    }
    if (fundedStatuses.includes(status)) {
      return CardsSummaryCategoriesEnum.enum.funded
    }
    if (withdrawnStatuses.includes(status)) {
      return CardsSummaryCategoriesEnum.enum.withdrawn
    }

    throw new Error(`Unknown status: ${status}`)
  }
}
