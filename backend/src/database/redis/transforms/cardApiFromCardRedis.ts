import { Card as CardApi } from '@shared/data/api/Card'

import type { Card as CardRedis } from '../data/Card'

export const cardApiFromCardRedis = (card: CardRedis) => CardApi.parse(card)
