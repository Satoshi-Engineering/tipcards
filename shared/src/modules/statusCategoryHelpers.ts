import { CardsSummaryCategoriesEnum } from '@shared/data/trpc/CardsSummaryDto.js'
import { CardStatusEnum, fundedStatuses, unfundedStatuses, userActionRequired, withdrawnStatuses } from '@shared/data/trpc/CardStatusDto.js'

export const getCardsSummaryStatusCategoryForCardStatus = (status: CardStatusEnum): CardsSummaryCategoriesEnum => {
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
