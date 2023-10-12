import type { Card as CardApi } from '../api/Card'
import { Card as CardRedis } from '../redis/Card'

export const cardRedisFromCardApi = (card: CardApi) => CardRedis.parse(card)
