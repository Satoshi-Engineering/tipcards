import { Card as CardApi } from '@shared/data/api/Card.js'

import type { Card as CardRedis } from '../data/Card.js'

export const cardApiFromCardRedis = (card: CardRedis) => CardApi.parse(card)
