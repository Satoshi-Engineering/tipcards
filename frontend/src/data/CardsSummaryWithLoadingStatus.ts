import type { CardsSummaryDto } from '@shared/data/trpc/CardsSummaryDto'
import type { SetDto } from '@shared/data/trpc/SetDto'

export type CardsSummaryWithLoadingStatus = { status: 'loading' | 'error' | undefined } | { status: 'success', cardsSummary: CardsSummaryDto }
export type CardsSummaryWithLoadingStatusBySetId = Record<SetDto['id'], CardsSummaryWithLoadingStatus>
