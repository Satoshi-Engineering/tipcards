import { randomUUID } from 'crypto'

import { AccessTokenPayload } from '@shared/data/auth'

import {
  Set, SetSettings,
  Card, CardVersion,
  Invoice, CardVersionHasInvoice,
  LnurlP, LnurlW,
  User, Profile,
  UserCanUseSet,
  LandingPage, UserCanUseLandingPage,
  Image, UserCanUseImage,
} from '@backend/database/drizzle/schema'
import { LandingPageType } from '@backend/database/drizzle/schema/enums/LandingPageType'
import hashSha256 from '@backend/services/hashSha256'
import { ImageType } from '@backend/database/drizzle/schema/enums/ImageType'

export const createRandomTextData = (prefix = '') => `${prefix}${randomUUID()}-random-text-data${randomUUID()}`
export const createRandomEmailData = (prefix = '') => `${prefix}${randomUUID()}@${randomUUID()}.com`

export const createSet = (): Set => ({
  id: randomUUID(),
  created: new Date(),
  changed: new Date(),
})

export const createSetSettings = (set: Set): SetSettings => ({
  set: set.id,
  name: hashSha256(randomUUID()),
  numberOfCards: 8,
  cardHeadline: 'SetSettings cardHeadline',
  cardCopytext: 'SetSettings cardCopytext',
  image: 'lightning',
  landingPage: 'default',
})

export const createCard = (): Card => ({
  hash: hashSha256(randomUUID()),
  created: new Date(),
  set: null,
})

export const createCardForSet = (set: Set, cardIndex: number): Card => ({
  hash: hashSha256(`${set.id}/${cardIndex}`),
  created: new Date(),
  set: set.id,
})

export const createCardVersion = (card: Card): CardVersion => {
  const id = randomUUID()
  return {
    id,
    card: card.hash,
    created: new Date(),
    lnurlP: null,
    lnurlW: null,
    textForWithdraw: `${id} textForWithdraw`,
    noteForStatusPage: `${id} noteForStatusPage`,
    sharedFunding: false,
    landingPageViewed: null,
  }
}

export const createInvoice = (amount: number, ...cardVersions: CardVersion[]): {
  invoice: Invoice,
  cardVersionsHaveInvoice: CardVersionHasInvoice[],
} => {
  const invoice = {
    amount,
    paymentHash: hashSha256(randomUUID()),
    paymentRequest: hashSha256(randomUUID()),
    created: new Date(),
    paid: null,
    expiresAt: new Date(+ new Date() + 5 * 60 * 1000),
    extra: '',
  }
  const cardVersionsHaveInvoice = cardVersions.map((cardVersion) => ({
    cardVersion: cardVersion.id,
    invoice: invoice.paymentHash,
  }))
  return { invoice, cardVersionsHaveInvoice }
}

/** side-effect: updates cardVersion.lnurlP */
export const createLnurlP = (cardVersion: CardVersion): LnurlP => {
  const lnurlp = {
    lnbitsId: hashSha256(randomUUID()),
    created: new Date(),
    expiresAt: null,
    finished: null,
  }
  cardVersion.lnurlP = lnurlp.lnbitsId
  return lnurlp
}

/** side-effect: updates cardVersion.lnurlW */
export const createLnurlW = (...cardVersions: CardVersion[]): LnurlW => {
  const lnurlw = {
    lnbitsId: hashSha256(randomUUID()),
    created: new Date(),
    expiresAt: null,
    withdrawn: null,
  }
  cardVersions.forEach((cardVersion) => {
    cardVersion.lnurlW = lnurlw.lnbitsId
  })
  return lnurlw
}

export const createUser = (): User => ({
  id: randomUUID(),
  lnurlAuthKey: hashSha256(randomUUID()),
  created: new Date(),
  permissions: [],
})

export const createUsers = (count: number): User[] => Array(count).fill('').map(() => createUser())

export const createAllowedRefreshTokens = (user: User, addPrevious = false) => {
  const current = hashSha256(randomUUID())
  let textForHash = user.id + current
  let previous: string | null = null
  if (addPrevious) {
    previous = hashSha256(randomUUID())
    textForHash += previous
  }
  return {
    hash: hashSha256(textForHash),
    user: user.id,
    current,
    previous,
  }
}

export const createProfileForUser = (user: User): Profile => ({
  user: user.id,
  accountName: createRandomTextData('Profile.accountName'),
  displayName: createRandomTextData('Profile.displayName'),
  email: createRandomEmailData('Profile.email'),
})

export const createUserCanUseLandingPage = (user: User, landingPage: LandingPage, canEdit = false): UserCanUseLandingPage => ({
  user: user.id,
  landingPage: landingPage.id,
  canEdit,
})

export const createUserCanEditSet = (user: User, set: Set): UserCanUseSet => ({
  user: user.id,
  set: set.id,
  canEdit: true,
})

export const createLandingPageTypeExternal = (): LandingPage => ({
  id: randomUUID(),
  type: LandingPageType.enum.external,
  name: hashSha256(randomUUID()),
  url: hashSha256(randomUUID()),
})

export const createLandingPagesTypeExternal = (count: number): LandingPage[] => Array(count).fill('').map(() => createLandingPageTypeExternal())

export const createImage = (imageType: Image['type'] = ImageType.enum.svg, data: Image['data'] = ''): Image => ({
  id: randomUUID(),
  type: imageType,
  name: hashSha256(randomUUID()),
  data,
})

export const createUserCanUseImage = (user: User, image: Image, canEdit = false): UserCanUseImage => ({
  user: user.id,
  image: image.id,
  canEdit,
})

export const createAccessTokenPayloadForUser = (user: User): AccessTokenPayload => ({
  id: user.id,
  lnurlAuthKey: user.lnurlAuthKey,
  permissions: AccessTokenPayload.shape.permissions.parse(user.permissions),
  nonce: randomUUID(),
})
