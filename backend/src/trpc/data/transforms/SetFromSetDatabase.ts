import { Set as SetDatabase } from '../../../../../src/data/Set'

import { Set } from '../Set'

export const SetFromSetDatabase = SetDatabase.transform((set) => Set.parse({
  id: set.id,
  name: set.settings?.setName,
  created: set.created != null ? new Date(set.created * 1000) : new Date(),
  changed: set.date != null ? new Date(set.date * 1000) : new Date(),
  numberOfCards: set.settings?.numberOfCards,
  cardHeadline: set.settings?.cardHeadline,
  cardCopytext: set.settings?.cardCopytext,
  cardImage: set.settings?.cardsQrCodeLogo,
  landingPage: set.settings?.landingPage,
}))
