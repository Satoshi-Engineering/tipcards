// import * as crypto from 'crypto'

import type { ProfileDto } from '@shared/data/trpc/ProfileDto'

export const generateProfile = (): ProfileDto => ({
  accountName: crypto.randomUUID(),
  displayName: crypto.randomUUID(),
  email: `${crypto.randomUUID()}@example.com`,
})
