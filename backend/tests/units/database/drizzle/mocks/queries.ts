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
} from '@backend/database/drizzle/schema'
import { all } from 'axios'

const setsById: Record<string, Set> = {}
const setSettingsBySetId: Record<string, SetSettings> = {}
const cardsByHash: Record<string, Card> = {}
const cardVersionsById: Record<string, CardVersion> = {}
const cardVersionInvoices: CardVersionHasInvoice[] = []
const invoicesByPaymentHash: Record<string, Invoice> = {}
const lnurlPsByLnbitsId: Record<string, LnurlP> = {}
const lnurlWsByLnbitsId: Record<string, LnurlW> = {}
const usersById: Record<string, User> = {}
const usersCanUseSets: UserCanUseSet[] = []
const landingPages: Record<string, LandingPage> = {}
const userCanUseLandingPages: Record<string, UserCanUseLandingPage> = {}
const images: Record<string, Image> = {}
const usersCanUseImages: UserCanUseImage[] = []
const profilesByUserId: Record<string, Profile> = {}
const allowedRefreshTokens: Record<string, AllowedRefreshTokens> = {}

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
export const addAllowedRefreshTokens = (...newAllowedRefreshTokens: AllowedRefreshTokens[]) => {
  addItemsToTable(allowedRefreshTokens, newAllowedRefreshTokens.map((newAllowedRefreshToken) => ({
    key: newAllowedRefreshToken.hash,
    item: newAllowedRefreshToken,
  })))
}
export const removeAllowedRefreshTokensForUserId = (userId: User['id']) => {
  Object.entries(allowedRefreshTokens).forEach(([hash, { user }]) => {
    if (user === userId) {
      delete allowedRefreshTokens[hash]
    }
  })
}

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
}

const addItemsToTable = <I>(table: Record<string, I>, items: { key: string, item: I }[]) => {
  items.forEach((item) => addItemToTable(table, item))
}
const addItemToTable = <I>(table: Record<string, I>, { key, item }: { key: string, item: I }) => {
  table[key] = item
}

const getSetById = async (setId: Set['id']): Promise<Set | null> => setsById[setId] || null

const getSetSettingsForSet = async (set: Set): Promise<SetSettings | null> => setSettingsBySetId[set.id] || null

const getSetSettingsBySetId = async (setId: Set['id']): Promise<SetSettings | null> => setSettingsBySetId[setId] || null

const getAllCardsForSet = async (set: Set): Promise<Card[]> => Object.values(cardsByHash).filter((card) => card.set === set.id)

const getAllCardsForSetBySetId = async (setId: Set['id']): Promise<Card[]> => Object.values(cardsByHash).filter((card) => card.set === setId)

const getLatestCardVersion = async (cardHash: Card['hash']): Promise<CardVersion | null> => {
  const cards = Object.values(cardVersionsById).filter((cardVersion) => cardVersion.card === cardHash)
  if (cards.length === 0) {
    return null
  }
  return cards.sort((a, b) => a.created.getTime() - b.created.getTime())[0]
}

const getLnurlPFundingCardVersion = async (cardVersion: CardVersion): Promise<LnurlP | null> => {
  if (cardVersion.lnurlP == null || lnurlPsByLnbitsId[cardVersion.lnurlP] == null) {
    return null
  }
  return lnurlPsByLnbitsId[cardVersion.lnurlP]
}

const getAllInvoicesFundingCardVersion = async (cardVersion: CardVersion): Promise<Invoice[]> => {
  const paymentHashes = cardVersionInvoices
    .filter((cardVersionInvoice) => cardVersionInvoice.cardVersion === cardVersion.id)
    .map((cardVersionInvoice) => cardVersionInvoice.invoice)
  return Object.values(invoicesByPaymentHash).filter((invoice) => paymentHashes.includes(invoice.paymentHash))
}

const getInvoiceByPaymentHash = async (paymentHash: Invoice['paymentHash']): Promise<Invoice | null> => {
  if (invoicesByPaymentHash[paymentHash] == null) {
    return null
  }
  return invoicesByPaymentHash[paymentHash]
}

const getUnpaidInvoicesForCardVersion = async (cardVersion: CardVersion) => {
  const paymentHashes = cardVersionInvoices
    .filter((cardVersionInvoice) => cardVersionInvoice.cardVersion === cardVersion.id)
    .map((cardVersionInvoice) => cardVersionInvoice.invoice)
  return Object.values(invoicesByPaymentHash).filter((invoice) => (
    paymentHashes.includes(invoice.paymentHash)
    && invoice.paid == null
  ))
}

const getAllCardVersionsFundedByInvoice = async (invoice: Invoice): Promise<CardVersion[]> => {
  const cardVersionIds = cardVersionInvoices
    .filter((cardVersionInvoice) => cardVersionInvoice.invoice === invoice.paymentHash)
    .map((cardVersionInvoice) => cardVersionInvoice.cardVersion)
  return Object.values(cardVersionsById).filter((cardVersion) => cardVersionIds.includes(cardVersion.id))
}

const getAllCardVersionInvoicesForInvoice = async (invoice: Invoice): Promise<CardVersionHasInvoice[]> => cardVersionInvoices
  .filter((cardVersionInvoice) => cardVersionInvoice.invoice === invoice.paymentHash)

const getLnurlWWithdrawingCardVersion = async (cardVersion: CardVersion): Promise<LnurlW | null> => {
  if (cardVersion.lnurlW == null || lnurlWsByLnbitsId[cardVersion.lnurlW] == null) {
    return null
  }
  return lnurlWsByLnbitsId[cardVersion.lnurlW]
}

const getAllCardVersionsWithdrawnByLnurlW = async (lnurlw: LnurlW): Promise<CardVersion[]> => {
  return Object.values(cardVersionsById).filter((cardVersion) => cardVersion.lnurlW === lnurlw.lnbitsId)
}

const getLnurlWById = async (id: LnurlW['lnbitsId']): Promise<LnurlW> => lnurlWsByLnbitsId[id] || null

const getAllLnurlWs = async (): Promise<LnurlW[]> => Object.values(lnurlWsByLnbitsId)

const getAllUsersThatCanUseSet = async (set: Set): Promise<UserCanUseSet[]> => usersCanUseSets
  .filter((userCanUseSet) => userCanUseSet.set === set.id)

const getAllUsersThatCanUseSetBySetId = async (setId: Set['id']): Promise<UserCanUseSet[]> => usersCanUseSets
  .filter((userCanUseSet) => userCanUseSet.set === setId)

const getSetsByUserId = async (userId: User['id']): Promise<Set[]> => usersCanUseSets
  .filter((userCanUseSet) => userCanUseSet.user === userId && setsById[userCanUseSet.set] != null)
  .map((userCanUseSet) => setsById[userCanUseSet.set])

const getLandingPage = async (landingPageId: LandingPage['id']): Promise<LandingPage | null> => landingPages[landingPageId] || null

const getUserCanUseLandingPagesByLandingPage = async (landingPage: LandingPage): Promise<UserCanUseLandingPage[]> => {
  return Object.keys(userCanUseLandingPages)
    .filter(privateKey => privateKey.includes(landingPage.id))
    .map(privateKey => userCanUseLandingPages[privateKey])
}

const getAllLandingPages = (): LandingPage[] => Object.values(landingPages)

const getAllUserCanUseLandingPagesForUser = async (user: User): Promise<UserCanUseLandingPage[]> => getAllUserCanUseLandingPagesForUserId(user.id)

const getAllUserCanUseLandingPagesForUserId = async (userId: User['id']): Promise<UserCanUseLandingPage[]> => Object.values(userCanUseLandingPages)
  .filter((userCanUseLandingPage) => userCanUseLandingPage.user === userId)

const getImageById = async (imageId: Image['id']): Promise<Image | null> => images[imageId] || null

const getAllUsersThatCanUseImage = async (image: Image): Promise<UserCanUseImage[]> => usersCanUseImages
  .filter((userCanUseImage) => userCanUseImage.image === image.id)

const getAllUserCanUseImagesForUser = async (user: User): Promise<UserCanUseImage[]> => getAllUserCanUseImagesForUserId(user.id)

const getAllUserCanUseImagesForUserId = async (userId: User['id']): Promise<UserCanUseImage[]> => usersCanUseImages
  .filter((userCanUseImage) => userCanUseImage.user === userId)

const getUserById = async (userId: User['id']): Promise<User | null> => usersById[userId] || null

const getUserByLnurlAuthKey = async (lnurlAuthKey: User['lnurlAuthKey']): Promise<User | null> => Object.values(usersById)
  .find((user) => user.lnurlAuthKey === lnurlAuthKey) || null

const getAllUsers = async (): Promise<User[]> => Object.values(usersById)

const getProfileByUserId = async (userId: User['id']): Promise<Profile | null> => profilesByUserId[userId] || null

const getAllAllowedRefreshTokensForUser = async (user: User): Promise<AllowedRefreshTokens[]> => getAllAllowedRefreshTokensForUserId(user.id)

export const getAllAllowedRefreshTokensForUserId = async (userId: User['id']): Promise<AllowedRefreshTokens[]> => Object.values(allowedRefreshTokens)
  .filter((allowedRefreshTokens) => allowedRefreshTokens.user === userId)

export const insertCards = jest.fn(async () => undefined)
export const insertCardVersions = jest.fn(async () => undefined)
export const insertInvoices = jest.fn(async () => undefined)
export const insertCardVersionInvoices = jest.fn(async () => undefined)
export const insertLnurlPs = jest.fn(async () => undefined)
export const insertLnurlWs = jest.fn(async () => undefined)

export const updateCard = jest.fn(async () => undefined)
export const updateCardVersion = jest.fn(async () => undefined)

export const insertOrUpdateCard = jest.fn(async () => undefined)
export const insertOrUpdateLatestCardVersion = jest.fn(async () => undefined)
export const insertOrUpdateInvoice = jest.fn(async () => undefined)
export const insertOrUpdateCardVersionInvoice = jest.fn(async () => undefined)
export const insertOrUpdateLnurlP = jest.fn(async () => undefined)
export const insertOrUpdateLnurlW = jest.fn(async () => undefined)
export const insertOrUpdateSet = jest.fn(async () => undefined)
export const insertOrUpdateSetSettings = jest.fn(async () => undefined)
export const insertOrUpdateUserCanUseSet = jest.fn(async () => undefined)
export const insertOrUpdateUser = jest.fn(async () => undefined)
export const insertOrUpdateProfile = jest.fn(async () => undefined)
export const insertOrUpdateAllowedRefreshTokens = jest.fn(async (allowedRefreshTokens: AllowedRefreshTokens) => addAllowedRefreshTokens(allowedRefreshTokens))

export const deleteCard = jest.fn(async () => undefined)
export const deleteCardVersion = jest.fn(async () => undefined)
export const deleteInvoice = jest.fn(async () => undefined)
export const deleteCardVersionInvoice = jest.fn(async () => undefined)
export const deleteLnurlW = jest.fn(async () => undefined)
export const deleteSet = jest.fn(async () => undefined)
export const deleteSetSettings = jest.fn(async () => undefined)
export const deleteUserCanUseSet = jest.fn(async () => undefined)
export const deleteAllAllowedRefreshTokensForUserId = jest.fn(async (userId: User['id']) => removeAllowedRefreshTokensForUserId(userId))

jest.mock('@backend/database/drizzle/queries', () => {
  return {
    getSetById,
    getSetSettingsForSet,
    getSetSettingsBySetId,
    getAllCardsForSet,
    getAllCardsForSetBySetId,
    getLatestCardVersion,
    getLnurlPFundingCardVersion,
    getLnurlWWithdrawingCardVersion,
    getAllCardVersionsWithdrawnByLnurlW,
    getAllInvoicesFundingCardVersion,
    getInvoiceByPaymentHash,
    getUnpaidInvoicesForCardVersion,
    getAllCardVersionsFundedByInvoice,
    getAllCardVersionInvoicesForInvoice,
    getLnurlWById,
    getAllLnurlWs,
    getAllUsersThatCanUseSet,
    getAllUsersThatCanUseSetBySetId,
    getSetsByUserId,
    getLandingPage,
    getUserCanUseLandingPagesByLandingPage,
    getAllLandingPages,
    getAllUserCanUseLandingPagesForUser,
    getAllUserCanUseLandingPagesForUserId,
    getImageById,
    getAllUsersThatCanUseImage,
    getAllUserCanUseImagesForUser,
    getAllUserCanUseImagesForUserId,
    getUserById,
    getUserByLnurlAuthKey,
    getAllUsers,
    getProfileByUserId,
    getAllAllowedRefreshTokensForUser,
    getAllAllowedRefreshTokensForUserId,

    insertCards,
    insertCardVersions,
    insertInvoices,
    insertCardVersionInvoices,
    insertLnurlPs,
    insertLnurlWs,

    updateCard,
    updateCardVersion,

    insertOrUpdateCard,
    insertOrUpdateLatestCardVersion,
    insertOrUpdateInvoice,
    insertOrUpdateCardVersionInvoice,
    insertOrUpdateLnurlP,
    insertOrUpdateLnurlW,
    insertOrUpdateSet,
    insertOrUpdateSetSettings,
    insertOrUpdateUserCanUseSet,
    insertOrUpdateUser,
    insertOrUpdateProfile,
    insertOrUpdateAllowedRefreshTokens,

    deleteCard,
    deleteCardVersion,
    deleteInvoice,
    deleteCardVersionInvoice,
    deleteLnurlW,
    deleteSet,
    deleteSetSettings,
    deleteUserCanUseSet,
    deleteAllAllowedRefreshTokensForUserId,
  }
})
