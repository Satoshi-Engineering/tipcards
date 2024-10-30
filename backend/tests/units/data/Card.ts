import { randomUUID } from 'crypto'

import { Card } from '@backend/database/schema/Card.js'
import hashSha256 from '@backend/services/hashSha256.js'

export const createCard = (): Card => ({
  hash: hashSha256(`${randomUUID}/0`),
  created: new Date(),
  set: null,
})
