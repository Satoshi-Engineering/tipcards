// import * as crypto from 'crypto'

import { Profile } from '@shared/data/trpc/Profile.js'

export const generateProfile = (): Profile => ({
  accountName: crypto.randomUUID(),
  displayName: crypto.randomUUID(),
  email: `${crypto.randomUUID()}@example.com`,
})
