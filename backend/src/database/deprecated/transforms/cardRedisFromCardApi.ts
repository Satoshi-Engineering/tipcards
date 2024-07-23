import type { Card as CardApi } from '@shared/data/api/Card.js'

import { Card as CardRedis } from '../data/Card.js'

export const cardRedisFromCardApi = (card: CardApi) => CardRedis.parse(card)
