import type {
  Set, SetSettings,
  Card, CardVersion,
  Invoice, CardVersionHasInvoice,
  LnurlP, LnurlW,
  User, UserCanUseSet,
} from '@backend/database/drizzle/schema'

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
}

const addItemsToTable = <I>(table: Record<string, I>, items: { key: string, item: I }[]) => {
  items.forEach((item) => addItemToTable(table, item))
}
const addItemToTable = <I>(table: Record<string, I>, { key, item }: { key: string, item: I }) => {
  table[key] = item
}

const getSetById = async (setId: Set['id']): Promise<Set | null> => setsById[setId] || null

const getSetSettingsForSet = async (set: Set): Promise<SetSettings | null> => setSettingsBySetId[set.id] || null

const getAllCardsForSet = async (set: Set): Promise<Card[]> => Object.values(cardsByHash).filter((card) => card.set === set.id)

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

const getLnurlWWithdrawingCardVersion = async (cardVersion: CardVersion): Promise<LnurlW | null> => {
  if (cardVersion.lnurlW == null || lnurlWsByLnbitsId[cardVersion.lnurlW] == null) {
    return null
  }
  return lnurlWsByLnbitsId[cardVersion.lnurlW]
}

const getAllCardsWithdrawnByLnurlW = async (lnurlw: LnurlW): Promise<CardVersion[]> => {
  return Object.values(cardVersionsById).filter((cardVersion) => cardVersion.lnurlW === lnurlw.lnbitsId)
}

const getAllUsersThatCanUseSet = async (set: Set): Promise<UserCanUseSet[]> => usersCanUseSets
  .filter((userCanUseSet) => userCanUseSet.set === set.id)

export const insertCards = jest.fn(async () => undefined)
export const insertCardVersions = jest.fn(async () => undefined)
export const insertInvoices = jest.fn(async () => undefined)
export const insertCardVersionInvoices = jest.fn(async () => undefined)
export const insertLnurlPs = jest.fn(async () => undefined)
export const insertLnurlWs = jest.fn(async () => undefined)

export const updateCardVesion = jest.fn(async () => undefined)
export const insertOrUpdateInvoice = jest.fn(async () => undefined)
export const insertOrUpdateCardVersionInvoice = jest.fn(async () => undefined)
export const insertOrUpdateLnurlP = jest.fn(async () => undefined)
export const insertOrUpdateLnurlW = jest.fn(async () => undefined)

export const deleteCard = jest.fn(async () => undefined)
export const deleteCardVersion = jest.fn(async () => undefined)
export const deleteInvoice = jest.fn(async () => undefined)
export const deleteCardVersionInvoice = jest.fn(async () => undefined)

jest.mock('@backend/database/drizzle/queries', () => {
  return {
    getSetById,
    getSetSettingsForSet,
    getAllCardsForSet,
    getLatestCardVersion,
    getLnurlPFundingCardVersion,
    getLnurlWWithdrawingCardVersion,
    getAllCardsWithdrawnByLnurlW,
    getAllInvoicesFundingCardVersion,
    getInvoiceByPaymentHash,
    getUnpaidInvoicesForCardVersion,
    getAllCardVersionsFundedByInvoice,
    getAllUsersThatCanUseSet,

    insertCards,
    insertCardVersions,
    insertInvoices,
    insertCardVersionInvoices,
    insertLnurlPs,
    insertLnurlWs,

    updateCardVesion,
    insertOrUpdateInvoice,
    insertOrUpdateCardVersionInvoice,
    insertOrUpdateLnurlP,
    insertOrUpdateLnurlW,

    deleteCard,
    deleteCardVersion,
    deleteInvoice,
    deleteCardVersionInvoice,
  }
})
