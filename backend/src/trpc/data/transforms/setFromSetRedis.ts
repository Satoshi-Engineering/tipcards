import { SetDeprecated } from '@shared/data/trpc/Set.js'

import type { Set as SetRedis } from '@backend/database/deprecated/data/Set.js'

export const setFromSetRedis = (set: SetRedis) => SetDeprecated.parse({
  id: set.id,
  name: set.settings?.setName,
  created: set.created != null ? new Date(set.created * 1000) : new Date(),
  changed: set.date != null ? new Date(set.date * 1000) : new Date(),
  numberOfCards: set.settings?.numberOfCards,
  cardHeadline: set.settings?.cardHeadline,
  cardCopytext: set.settings?.cardCopytext,
  cardImage: set.settings?.cardsQrCodeLogo,
  landingPage: set.settings?.landingPage,
})
