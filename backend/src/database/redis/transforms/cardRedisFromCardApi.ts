import type { Card as CardApi } from '@shared/data/api/Card'

import { Card as CardRedis } from '../data/Card'

export const cardRedisFromCardApi = (card: CardApi) => CardRedis.parse(card)
