// import * as crypto from 'crypto'

import type { ProfileDto } from '@shared/data/trpc/tipcards/ProfileDto'

export const generateProfile = (): ProfileDto => ({
  accountName: crypto.randomUUID(),
  displayName: crypto.randomUUID(),
  email: `${crypto.randomUUID()}@example.com`,
})
