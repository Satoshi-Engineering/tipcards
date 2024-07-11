import { vi } from 'vitest'

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

import {
  setsById,
  setSettingsBySetId,
  cardsByHash,
  cardVersionsById,
  cardVersionInvoices,
  invoicesByPaymentHash,
  lnurlPsByLnbitsId,
  lnurlWsByLnbitsId,
  usersById,
  usersCanUseSets,
  landingPages,
  userCanUseLandingPages,
  images,
  usersCanUseImages,
  profilesByUserId,
  allowedRefreshTokensByHash,

  addSets,
  addSetSettings,
  addCards,
  addCardVersions,
  addInvoices,
  addCardVersionInvoices,
  addLnurlPs,
  addLnurlWs,
  addUsersCanUseSets,

  removeAllowedRefreshTokensForUserId,
} from './database.js'

const getLatestCardVersion = async (cardHash: Card['hash']): Promise<CardVersion | null> => {
  const cards = Object.values(cardVersionsById).filter((cardVersion) => cardVersion.card === cardHash)
  if (cards.length === 0) {
    return null
  }
  return cards.sort((a, b) => a.created.getTime() - b.created.getTime())[0]
}

export default vi.fn().mockImplementation(() => ({
  getSetById: async (setId: Set['id']): Promise<Set | null> => setsById[setId] || null,

  getSetSettingsForSet: async (set: Set): Promise<SetSettings | null> => setSettingsBySetId[set.id] || null,

  getSetSettingsBySetId: async (setId: Set['id']): Promise<SetSettings | null> => setSettingsBySetId[setId] || null,

  getAllCardsForSet: async (set: Set): Promise<Card[]> => Object.values(cardsByHash).filter((card) => card.set === set.id),

  getAllCardsForSetBySetId: async (setId: Set['id']): Promise<Card[]> => Object.values(cardsByHash).filter((card) => card.set === setId),

  getLatestCardVersion,

  getLnurlPFundingCardVersion: async (cardVersion: CardVersion): Promise<LnurlP | null> => {
    if (cardVersion.lnurlP == null || lnurlPsByLnbitsId[cardVersion.lnurlP] == null) {
      return null
    }
    return lnurlPsByLnbitsId[cardVersion.lnurlP]
  },

  getAllInvoicesFundingCardVersion: async (cardVersion: CardVersion): Promise<Invoice[]> => {
    const paymentHashes = cardVersionInvoices
      .filter((cardVersionInvoice) => cardVersionInvoice.cardVersion === cardVersion.id)
      .map((cardVersionInvoice) => cardVersionInvoice.invoice)
    return Object.values(invoicesByPaymentHash).filter((invoice) => paymentHashes.includes(invoice.paymentHash))
  },

  getInvoiceByPaymentHash: async (paymentHash: Invoice['paymentHash']): Promise<Invoice | null> => {
    if (invoicesByPaymentHash[paymentHash] == null) {
      return null
    }
    return invoicesByPaymentHash[paymentHash]
  },

  getUnpaidInvoicesForCardVersion: async (cardVersion: CardVersion) => {
    const paymentHashes = cardVersionInvoices
      .filter((cardVersionInvoice) => cardVersionInvoice.cardVersion === cardVersion.id)
      .map((cardVersionInvoice) => cardVersionInvoice.invoice)
    return Object.values(invoicesByPaymentHash).filter((invoice) => (
      paymentHashes.includes(invoice.paymentHash)
      && invoice.paid == null
    ))
  },

  getAllCardVersionsFundedByInvoice: async (invoice: Invoice): Promise<CardVersion[]> => {
    const cardVersionIds = cardVersionInvoices
      .filter((cardVersionInvoice) => cardVersionInvoice.invoice === invoice.paymentHash)
      .map((cardVersionInvoice) => cardVersionInvoice.cardVersion)
    return Object.values(cardVersionsById).filter((cardVersion) => cardVersionIds.includes(cardVersion.id))
  },

  getAllCardVersionInvoicesForInvoice: async (invoice: Invoice): Promise<CardVersionHasInvoice[]> => cardVersionInvoices
    .filter((cardVersionInvoice) => cardVersionInvoice.invoice === invoice.paymentHash),

  getLnurlWWithdrawingCardVersion: async (cardVersion: CardVersion): Promise<LnurlW | null> => {
    if (cardVersion.lnurlW == null || lnurlWsByLnbitsId[cardVersion.lnurlW] == null) {
      return null
    }
    return lnurlWsByLnbitsId[cardVersion.lnurlW]
  },

  getAllCardVersionsWithdrawnByLnurlW: async (lnurlw: LnurlW): Promise<CardVersion[]> => {
    return Object.values(cardVersionsById).filter((cardVersion) => cardVersion.lnurlW === lnurlw.lnbitsId)
  },

  getLnurlWById: async (id: LnurlW['lnbitsId']): Promise<LnurlW> => lnurlWsByLnbitsId[id] || null,

  getLnurlWByBulkWithdrawId: async (bulkWithdrawId: LnurlW['bulkWithdrawId']): Promise<LnurlW | null> => {
    return Object.values(lnurlWsByLnbitsId).find((lnurlW) => lnurlW.bulkWithdrawId === bulkWithdrawId) || null
  },

  getLnurlWByCardHash: async (cardHash: Card['hash']): Promise<LnurlW | null> => {
    const cardVersion = await getLatestCardVersion(cardHash)
    if (cardVersion?.lnurlW == null) {
      return null
    }
    return Object.values(lnurlWsByLnbitsId).find((lnurlW) => lnurlW.lnbitsId == cardVersion.lnurlW) || null
  },

  getAllLnurlWs: async (): Promise<LnurlW[]> => Object.values(lnurlWsByLnbitsId),

  getAllLnurlWsWithBulkWithdrawId: async (): Promise<LnurlW[]> => Object.values(lnurlWsByLnbitsId).filter(({ bulkWithdrawId }) => bulkWithdrawId != null),

  getAllUsersThatCanUseSet: async (set: Set): Promise<UserCanUseSet[]> => usersCanUseSets
    .filter((userCanUseSet) => userCanUseSet.set === set.id),

  getAllUsersThatCanUseSetBySetId: async (setId: Set['id']): Promise<UserCanUseSet[]> => usersCanUseSets
    .filter((userCanUseSet) => userCanUseSet.set === setId),

  getSetsByUserId: async (userId: User['id']): Promise<Set[]> => usersCanUseSets
    .filter((userCanUseSet) => userCanUseSet.user === userId && setsById[userCanUseSet.set] != null)
    .map((userCanUseSet) => setsById[userCanUseSet.set]),

  getLandingPage: async (landingPageId: LandingPage['id']): Promise<LandingPage | null> => landingPages[landingPageId] || null,

  getUserCanUseLandingPagesByLandingPage: async (landingPage: LandingPage): Promise<UserCanUseLandingPage[]> => {
    return Object.keys(userCanUseLandingPages)
      .filter(privateKey => privateKey.includes(landingPage.id))
      .map(privateKey => userCanUseLandingPages[privateKey])
  },

  getAllLandingPages: async (): Promise<LandingPage[]> => Object.values(landingPages),

  getAllUserCanUseLandingPagesForUser: async (user: User): Promise<UserCanUseLandingPage[]> => Object.values(userCanUseLandingPages)
    .filter((userCanUseLandingPage) => userCanUseLandingPage.user === user.id),

  getAllUserCanUseLandingPagesForUserId: async (userId: User['id']): Promise<UserCanUseLandingPage[]> => Object.values(userCanUseLandingPages)
    .filter((userCanUseLandingPage) => userCanUseLandingPage.user === userId),

  getImageById: async (imageId: Image['id']): Promise<Image | null> => images[imageId] || null,

  getAllUsersThatCanUseImage: async (image: Image): Promise<UserCanUseImage[]> => usersCanUseImages
    .filter((userCanUseImage) => userCanUseImage.image === image.id),

  getAllUserCanUseImagesForUser: async (user: User): Promise<UserCanUseImage[]> => usersCanUseImages
    .filter((userCanUseImage) => userCanUseImage.user === user.id),

  getAllUserCanUseImagesForUserId: async (userId: User['id']): Promise<UserCanUseImage[]> => usersCanUseImages
    .filter((userCanUseImage) => userCanUseImage.user === userId),

  getUserById: async (userId: User['id']): Promise<User | null> => usersById[userId] || null,

  getUserByLnurlAuthKey: async (lnurlAuthKey: User['lnurlAuthKey']): Promise<User | null> => Object.values(usersById)
    .find((user) => user.lnurlAuthKey === lnurlAuthKey) || null,

  getAllUsers: async (): Promise<User[]> => Object.values(usersById),

  getProfileByUserId: async (userId: User['id']): Promise<Profile | null> => profilesByUserId[userId] || null,

  getAllAllowedRefreshTokensForUser: async (user: User): Promise<AllowedRefreshTokens[]> => Object.values(allowedRefreshTokensByHash)
    .filter((allowedRefreshTokens) => allowedRefreshTokens.user === user.id),

  getAllAllowedRefreshTokensForUserId: async (userId: User['id']): Promise<AllowedRefreshTokens[]> => Object.values(allowedRefreshTokensByHash)
    .filter((allowedRefreshTokens) => allowedRefreshTokens.user === userId),

  insertCards: vi.fn(async (...cards: Card[]): Promise<void> => {
    cards.forEach((card) => {
      if (cardsByHash[card.hash] != null) {
        throw new Error(`Card with hash ${card.hash} already exists`)
      }
    })
    addCards(...cards)
  }),

  insertCardVersions: vi.fn(async (...cardVersions: CardVersion[]): Promise<void> => addCardVersions(...cardVersions)),

  insertInvoices: vi.fn(async (...invoices: Invoice[]): Promise<void> => addInvoices(...invoices)),

  insertCardVersionInvoices: vi.fn(async (...cardVersionInvoices: CardVersionHasInvoice[]): Promise<void> => addCardVersionInvoices(...cardVersionInvoices)),

  insertLnurlPs: vi.fn(async (...lnurlps: LnurlP[]): Promise<void> => addLnurlPs(...lnurlps)),

  insertLnurlWs: vi.fn(async (...lnurlws: LnurlW[]): Promise<void> => addLnurlWs(...lnurlws)),

  insertSets: vi.fn(async (...sets: Set[]): Promise<void> => addSets(...sets)),

  insertSetSettings: vi.fn(async (...setSettings: SetSettings[]): Promise<void> => addSetSettings(...setSettings)),

  insertUsersCanUseSets: vi.fn(async (...usersCanUseSets: UserCanUseSet[]): Promise<void> => addUsersCanUseSets(...usersCanUseSets)),

  insertOrUpdateCard: vi.fn(async (card: Card): Promise<void> => {
    cardsByHash[card.hash] = card
  }),

  insertOrUpdateLatestCardVersion: vi.fn(async (cardVersion: CardVersion): Promise<void> => {
    cardVersionsById[cardVersion.id] = cardVersion
  }),

  insertOrUpdateInvoice: vi.fn(async (invoice: Invoice): Promise<void> => {
    invoicesByPaymentHash[invoice.paymentHash] = invoice
  }),

  insertOrUpdateCardVersionInvoice: vi.fn(async (cardVersionInvoice: CardVersionHasInvoice): Promise<void> => {
    if (cardVersionInvoices.find((current) => current.cardVersion === cardVersionInvoice.cardVersion && current.invoice === cardVersionInvoice.invoice)) {
      return
    }
    cardVersionInvoices.push(cardVersionInvoice)
  }),

  insertOrUpdateLnurlP: vi.fn(async (lnurlp: LnurlP): Promise<void> => {
    lnurlPsByLnbitsId[lnurlp.lnbitsId] = lnurlp
  }),

  insertOrUpdateLnurlW: vi.fn(async (lnurlw: LnurlW): Promise<void> => {
    lnurlWsByLnbitsId[lnurlw.lnbitsId] = lnurlw
  }),

  insertOrUpdateSet: vi.fn(async (set: Set): Promise<void> => {
    setsById[set.id] = set
  }),

  insertOrUpdateSetSettings: vi.fn(async (setSettings: SetSettings): Promise<void> => {
    setSettingsBySetId[setSettings.set] = setSettings
  }),

  insertOrUpdateUser: vi.fn(async (user: User): Promise<void> => {
    usersById[user.id] = user
  }),

  insertOrUpdateUserCanUseSet: vi.fn(async (userCanUseSet: UserCanUseSet): Promise<void> => {
    if (usersCanUseSets.find((current) => current.user === userCanUseSet.user && current.set === userCanUseSet.set)) {
      return
    }
    usersCanUseSets.push(userCanUseSet)
  }),

  insertOrUpdateProfile: vi.fn(async (profile: Profile): Promise<void> => {
    profilesByUserId[profile.user] = profile
  }),

  insertOrUpdateAllowedRefreshTokens: vi.fn(async (allowedRefreshTokens: AllowedRefreshTokens): Promise<void> => {
    allowedRefreshTokensByHash[allowedRefreshTokens.hash] = allowedRefreshTokens
  }),

  updateCard: vi.fn(async (card: Card): Promise<void> => {
    cardsByHash[card.hash] = card
  }),

  updateCardVersion: vi.fn(async (cardVersion: CardVersion): Promise<void> => {
    cardVersionsById[cardVersion.id] = cardVersion
  }),

  deleteCard: vi.fn(async (card: Card): Promise<void> => {
    delete cardsByHash[card.hash]
  }),

  deleteCardVersion: vi.fn(async (cardVersion: CardVersion): Promise<void> => {
    delete cardVersionsById[cardVersion.id]
  }),

  deleteInvoice: vi.fn(async (invoice: Invoice): Promise<void> => {
    delete invoicesByPaymentHash[invoice.paymentHash]
  }),

  deleteCardVersionInvoice: vi.fn(async (cardVersionInvoice: CardVersionHasInvoice): Promise<void> => {
    const index = cardVersionInvoices.findIndex((current) => current.cardVersion === cardVersionInvoice.cardVersion && current.invoice === cardVersionInvoice.invoice)
    if (index >= 0) {
      cardVersionInvoices.splice(index, 1)
    }
  }),

  deleteLnurlWByBulkWithdrawId: vi.fn(async (bulkWithdrawId: string): Promise<void> => {
    const lnurlW = Object.values(lnurlWsByLnbitsId).find((lnurlW) => lnurlW.bulkWithdrawId === bulkWithdrawId)
    if (lnurlW != null) {
      delete lnurlWsByLnbitsId[lnurlW.lnbitsId]
    }
  }),

  deleteSet: vi.fn(async (set: Set): Promise<void> => {
    delete setsById[set.id]
  }),

  deleteSetSettings: vi.fn(async (setSettings: SetSettings): Promise<void> => {
    delete setSettingsBySetId[setSettings.set]
  }),

  deleteUserCanUseSet: vi.fn(async (userCanUseSet: UserCanUseSet): Promise<void> => {
    const index = usersCanUseSets.findIndex((current) => current.user === userCanUseSet.user && current.set === userCanUseSet.set)
    if (index >= 0) {
      usersCanUseSets.splice(index, 1)
    }
  }),

  deleteAllAllowedRefreshTokensForUserId: vi.fn(async (userId: User['id']): Promise<void> => {
    removeAllowedRefreshTokensForUserId(userId)
  }),

  getCardByHash: vi.fn(async (hash: Card['hash']): Promise<Card | null> => cardsByHash[hash] || null),

  setCardLock: vi.fn(async (hash: Card['hash'], lockValue: string): Promise<void> => {
    if (cardsByHash[hash] == null) {
      throw new Error(`Card with ${hash} does not exist`)
    }
    if (cardsByHash[hash].locked != null) {
      throw new Error(`Card with hash ${hash} already locked`)
    }
    cardsByHash[hash].locked = lockValue
  }),

  releaseCardLock: vi.fn(async (hash: Card['hash'], lockValue: string): Promise<void> => {
    if (cardsByHash[hash] == null) {
      throw new Error(`Card with ${hash} does not exist`)
    }
    if (cardsByHash[hash].locked == null) {
      throw new Error(`Card with hash ${hash} is not locked`)
    }
    if (cardsByHash[hash].locked !== lockValue) {
      throw new Error(`Card with hash ${hash} was locked with different lockValue: Card lock: ${cardsByHash[hash].locked}, lockValue: ${lockValue}`)
    }
    cardsByHash[hash].locked = null
  }),
}))
