import {
  Set, SetSettings,
  Card, CardVersion,
  Invoice, CardVersionHasInvoice,
  LnurlP, LnurlW,
  User, Profile,
  AllowedRefreshTokens,
  UserCanUseSet,
  Image, UserCanUseImage,
  LandingPage, UserCanUseLandingPage,
  AllowedSession,
} from '@backend/database/schema/index.js'

export const setsById: Record<string, Set> = {}
export const setSettingsBySetId: Record<string, SetSettings> = {}
export const cardsByHash: Record<string, Card> = {}
export const cardVersionsById: Record<string, CardVersion> = {}
export const cardVersionInvoices: CardVersionHasInvoice[] = []
export const invoicesByPaymentHash: Record<string, Invoice> = {}
export const lnurlPsByLnbitsId: Record<string, LnurlP> = {}
export const lnurlWsByLnbitsId: Record<string, LnurlW> = {}
export const usersById: Record<string, User> = {}
export const usersCanUseSets: UserCanUseSet[] = []
export const landingPages: Record<string, LandingPage> = {}
export const userCanUseLandingPages: Record<string, UserCanUseLandingPage> = {}
export const images: Record<string, Image> = {}
export const usersCanUseImages: UserCanUseImage[] = []
export const profilesByUserId: Record<string, Profile> = {}
export const allowedRefreshTokensByHash: Record<string, AllowedRefreshTokens> = {}
export const allowedSessionsById: Record<string, AllowedSession> = {}

export const addData = ({
  sets,
  setSettings,
  cards,
  cardVersions,
  invoices,
  cardVersionInvoices,
  lnurlps,
  lnurlws,
  users,
  usersCanUseSets,
  landingPages,
  userCanUseLandingPages,
  images,
  usersCanUseImages,
  profiles,
  allowedRefreshTokens,
  allowedSessions,
}: {
  sets?: Set[],
  setSettings?: SetSettings[],
  cards?: Card[],
  cardVersions?: CardVersion[],
  invoices?: Invoice[],
  cardVersionInvoices?: CardVersionHasInvoice[],
  lnurlps?: LnurlP[],
  lnurlws?: LnurlW[],
  users?: User[],
  usersCanUseSets?: UserCanUseSet[],
  landingPages?: LandingPage[],
  userCanUseLandingPages?: UserCanUseLandingPage[],
  images?: Image[],
  usersCanUseImages?: UserCanUseImage[],
  profiles?: Profile[],
  allowedRefreshTokens?: AllowedRefreshTokens[],
  allowedSessions?: AllowedSession[],
}) => {
  addSets(...(sets || []))
  addSetSettings(...(setSettings || []))
  addCards(...(cards || []))
  addCardVersions(...(cardVersions || []))
  addInvoices(...(invoices || []))
  addCardVersionInvoices(...(cardVersionInvoices || []))
  addLnurlPs(...(lnurlps || []))
  addLnurlWs(...(lnurlws || []))
  addUsers(...(users || []))
  addUsersCanUseSets(...(usersCanUseSets || []))
  addLandingPage(...(landingPages || []))
  addUserCanUseLandingPages(...(userCanUseLandingPages || []))
  addImages(...(images || []))
  addUsersCanUseImages(...(usersCanUseImages || []))
  addProfiles(...(profiles || []))
  addAllowedRefreshTokens(...(allowedRefreshTokens || []))
  addAllowedSessions(...(allowedSessions || []))
}

export const addSets = (...sets: Set[]) => {
  addItemsToTable(setsById, sets.map((set) => ({ key: set.id, item: set })))
}
export const addSetSettings = (...setSettings: SetSettings[]) => {
  addItemsToTable(setSettingsBySetId, setSettings.map((setSettings) => ({ key: setSettings.set, item: setSettings })))
}
export const addCards = (...cards: Card[]) => {
  addItemsToTable(cardsByHash, cards.map((card) => ({ key: card.hash, item: card })))
}
export const addCardVersions = (...cardVersions: CardVersion[]) => {
  addItemsToTable(cardVersionsById, cardVersions.map((cardVersion) => ({ key: cardVersion.id, item: cardVersion })))
}
export const addInvoices = (...invoices: Invoice[]) => {
  addItemsToTable(invoicesByPaymentHash, invoices.map((invoice) => ({ key: invoice.paymentHash, item: invoice })))
}
export const addCardVersionInvoices = (...newCardVersionInvoices: CardVersionHasInvoice[]) => {
  cardVersionInvoices.push(...newCardVersionInvoices)
}
export const addLnurlPs = (...lnurlps: LnurlP[]) => {
  addItemsToTable(lnurlPsByLnbitsId, lnurlps.map((lnurlp) => ({ key: lnurlp.lnbitsId, item: lnurlp })))
}
export const addLnurlWs = (...lnurlws: LnurlW[]) => {
  addItemsToTable(lnurlWsByLnbitsId, lnurlws.map((lnurlw) => ({ key: lnurlw.lnbitsId, item: lnurlw })))
}
export const addUsers = (...users: User[]) => {
  addItemsToTable(usersById, users.map((user) => ({ key: user.id, item: user })))
}
export const addUsersCanUseSets = (...newUsersCanUseSets: UserCanUseSet[]) => {
  usersCanUseSets.push(...newUsersCanUseSets)
}
export const addLandingPage = (...newLandingPages: LandingPage[]) => {
  addItemsToTable(landingPages, newLandingPages.map((landingPage) => ({ key: landingPage.id, item: landingPage })))
}
export const addUserCanUseLandingPages = (...newUserCanUseLandingPages: UserCanUseLandingPage[]) => {
  addItemsToTable(userCanUseLandingPages, newUserCanUseLandingPages.map((userCanUseLandingPage) => ({
    key: `${userCanUseLandingPage.user}${userCanUseLandingPage.landingPage}`,
    item: userCanUseLandingPage,
  })))
}
export const addImages = (...newImages: Image[]) => {
  addItemsToTable(images, newImages.map((newImage) => ({ key: newImage.id, item: newImage })))
}
export const addUsersCanUseImages = (...newUsersCanUseImages: UserCanUseImage[]) => {
  usersCanUseImages.push(...newUsersCanUseImages)
}
export const addProfiles = (...newProfiles: Profile[]) => {
  addItemsToTable(profilesByUserId, newProfiles.map((profile) => ({
    key: profile.user,
    item: profile,
  })))
}
export const addAllowedRefreshTokens = (...allowedRefreshTokens: AllowedRefreshTokens[]) => {
  addItemsToTable(allowedRefreshTokensByHash, allowedRefreshTokens.map((allowedRefreshToken) => ({
    key: allowedRefreshToken.hash,
    item: allowedRefreshToken,
  })))
}

export const addAllowedSessions = (...allowedSessions: AllowedSession[]) => {
  addItemsToTable(allowedSessionsById, allowedSessions.map((allowedSession) => ({ key: allowedSession.sessionId, item: allowedSession })))
}

export const removeAllowedRefreshTokensForUserId = (userId: User['id']) => {
  Object.entries(allowedRefreshTokensByHash).forEach(([hash, { user }]) => {
    if (user === userId) {
      delete allowedRefreshTokensByHash[hash]
    }
  })
}

const addItemsToTable = <I>(table: Record<string, I>, items: { key: string, item: I }[]) => {
  items.forEach((item) => addItemToTable(table, item))
}
const addItemToTable = <I>(table: Record<string, I>, { key, item }: { key: string, item: I }) => {
  table[key] = item
}
