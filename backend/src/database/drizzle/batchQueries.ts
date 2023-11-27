import {
  Card, CardVersion,
  Invoice, CardVersionHasInvoice,
  LnurlP, LnurlW,
  Set, SetSettings,
  User,
  UserCanUseSet,
  Profile,
AllowedRefreshTokens,
} from '@backend/database/drizzle/schema'
import {
  insertCards, insertCardVersions,
  insertInvoices, insertCardVersionInvoices,
  insertLnurlPs, insertLnurlWs,
  insertSets, insertSetSettings,
  insertUsersCanUseSets,
  insertOrUpdateCard, insertOrUpdateLatestCardVersion,
  insertOrUpdateInvoice, insertOrUpdateCardVersionInvoice,
  insertOrUpdateLnurlP, insertOrUpdateLnurlW,
  insertOrUpdateSet, insertOrUpdateSetSettings,
  insertOrUpdateUser,
  insertOrUpdateProfile,
  insertOrUpdateUserCanUseSet,
  updateCard, updateCardVersion,
  deleteCard, deleteCardVersion,
  deleteInvoice, deleteCardVersionInvoice,
  deleteSet, deleteSetSettings,
  deleteUserCanUseSet,
  insertOrUpdateAllowedRefreshTokens,
} from '@backend/database/drizzle/queries'

export type DataObjects = {
  cards?: Card[],
  cardVersions?: CardVersion[],
  invoices?: Invoice[],
  cardVersionInvoices?: CardVersionHasInvoice[],
  lnurlPs?: LnurlP[],
  lnurlWs?: LnurlW[],
  sets?: Set[],
  setSettings?: SetSettings[],
  users?: User[],
  profiles?: Profile[],
  usersCanUseSets?: UserCanUseSet[],
  allowedRefreshTokens?: AllowedRefreshTokens[],
}

/** @throws */
export const insertDataObjects = async (data: DataObjects): Promise<void> => {
  if (data.lnurlPs != null) {
    await insertLnurlPs(...data.lnurlPs)
  }
  if (data.lnurlWs != null) {
    await insertLnurlWs(...data.lnurlWs)
  }
  if (data.cards != null) {
    await insertCards(...data.cards)
  }
  if (data.cardVersions != null) {
    await insertCardVersions(...data.cardVersions)
  }
  if (data.invoices != null) {
    await insertInvoices(...data.invoices)
  }
  if (data.cardVersionInvoices != null) {
    await insertCardVersionInvoices(...data.cardVersionInvoices)
  }
  if (data.sets != null) {
    await insertSets(...data.sets)
  }
  if (data.setSettings != null) {
    await insertSetSettings(...data.setSettings)
  }
  if (data.usersCanUseSets != null) {
    await insertUsersCanUseSets(...data.usersCanUseSets)
  }
}

export const insertOrUpdateDataObjects = async (data: DataObjects): Promise<void> => {
  if (data.lnurlPs != null) {
    await Promise.all(data.lnurlPs.map((lnurlP) => insertOrUpdateLnurlP(lnurlP)))
  }
  if (data.lnurlWs != null) {
    await Promise.all(data.lnurlWs.map((lnurlW) => insertOrUpdateLnurlW(lnurlW)))
  }
  if (data.cards != null) {
    await Promise.all(data.cards.map((card) => insertOrUpdateCard(card)))
  }
  if (data.cardVersions != null) {
    await Promise.all(data.cardVersions.map((cardVersion) => insertOrUpdateLatestCardVersion(cardVersion)))
  }
  if (data.invoices != null) {
    await Promise.all(
      data.invoices.map((invoice) => insertOrUpdateInvoice(invoice)),
    )
  }
  if (data.cardVersionInvoices != null) {
    await Promise.all(
      data.cardVersionInvoices.map((cardVersionInvoice) => insertOrUpdateCardVersionInvoice(cardVersionInvoice)),
    )
  }
  if (data.sets != null) {
    await Promise.all(data.sets.map((set) => insertOrUpdateSet(set)))
  }
  if (data.setSettings != null) {
    await Promise.all(data.setSettings.map((setSettings) => insertOrUpdateSetSettings(setSettings)))
  }
  if (data.usersCanUseSets != null) {
    await Promise.all(data.usersCanUseSets.map((userCanUseSet) => insertOrUpdateUserCanUseSet(userCanUseSet)))
  }
  if (data.users != null) {
    await Promise.all(data.users.map((user) => insertOrUpdateUser(user)))
  }
  if (data.profiles != null) {
    await Promise.all(data.profiles.map((profile) => insertOrUpdateProfile(profile)))
  }
  if (data.allowedRefreshTokens != null) {
    await Promise.all(data.allowedRefreshTokens.map((allowedRefreshTokens) => insertOrUpdateAllowedRefreshTokens(allowedRefreshTokens)))
  }
}

export const updateDataObjects = async (data: DataObjects): Promise<void> => {
  if (data.cards != null) {
    await Promise.all(data.cards.map((card) => updateCard(card)))
  }
  if (data.cardVersions != null) {
    await Promise.all(data.cardVersions.map((cardVersion) => updateCardVersion(cardVersion)))
  }
}

export const deleteDataObjects = async (data: DataObjects): Promise<void> => {
  if (data.cardVersionInvoices != null) {
    await Promise.all(
      data.cardVersionInvoices.map((cardVersionInvoice) => deleteCardVersionInvoice(cardVersionInvoice)),
    )
  }
  if (data.invoices != null) {
    await Promise.all(
      data.invoices.map((invoice) => deleteInvoice(invoice)),
    )
  }
  if (data.cardVersions != null) {
    await Promise.all(data.cardVersions.map((cardVersion) => deleteCardVersion(cardVersion)))
  }
  if (data.cards != null) {
    await Promise.all(data.cards.map((card) => deleteCard(card)))
  }
  if (data.usersCanUseSets != null) {
    await Promise.all(data.usersCanUseSets.map((userCanUseSet) => deleteUserCanUseSet(userCanUseSet)))
  }
  if (data.setSettings != null) {
    await Promise.all(data.setSettings.map((setSettings) => deleteSetSettings(setSettings)))
  }
  if (data.sets != null) {
    await Promise.all(data.sets.map((set) => deleteSet(set)))
  }
}
