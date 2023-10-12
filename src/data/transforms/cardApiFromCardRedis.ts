import { Card as CardApi } from '../api/Card'
import type { Card as CardRedis } from '../redis/Card'

export const cardApiFromCardRedis = (card: CardRedis) => CardApi.parse(card)
