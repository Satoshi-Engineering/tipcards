import { randomUUID } from 'crypto'

export const createUserId = () => randomUUID().replace(/-/g, '') // redis search cannot process hyphens (-) in indices

export type User = {
  id: string, // uuid but without hyphens (see above)
  lnurlAuthKey: string, // lnurl auth key
}
