import type {
  Card, CardVersion,
  Invoice, CardVersionHasInvoice,
  LnurlP, LnurlW,
  Set, SetSettings,
  User,
  UserCanUseSet,
  Profile,
  AllowedRefreshTokens,
} from '@backend/database/schema/index.js'
import type Queries from '@backend/database/Queries.js'

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
export const insertDataObjects = async (queries: Queries, data: DataObjects): Promise<void> => {
  if (data.sets != null) {
    await queries.insertSets(...data.sets)
  }
  if (data.lnurlPs != null) {
    await queries.insertLnurlPs(...data.lnurlPs)
  }
  if (data.lnurlWs != null) {
    await queries.insertLnurlWs(...data.lnurlWs)
  }
  if (data.cards != null) {
    await queries.insertCards(...data.cards)
  }
  if (data.cardVersions != null) {
    await queries.insertCardVersions(...data.cardVersions)
  }
  if (data.invoices != null) {
    await queries.insertInvoices(...data.invoices)
  }
  if (data.cardVersionInvoices != null) {
    await queries.insertCardVersionInvoices(...data.cardVersionInvoices)
  }
  if (data.setSettings != null) {
    await queries.insertSetSettings(...data.setSettings)
  }
  if (data.usersCanUseSets != null) {
    await queries.insertUsersCanUseSets(...data.usersCanUseSets)
  }
}

/** @throws */
export const insertOrUpdateDataObjects = async (queries: Queries, data: DataObjects): Promise<void> => {
  await makeSureOnlyASingleVersionExistsPerCard(queries, data)

  if (data.sets != null) {
    await Promise.all(data.sets.map((set) => queries.insertOrUpdateSet(set)))
  }
  if (data.lnurlPs != null) {
    await Promise.all(data.lnurlPs.map((lnurlP) => queries.insertOrUpdateLnurlP(lnurlP)))
  }
  if (data.lnurlWs != null) {
    await Promise.all(data.lnurlWs.map((lnurlW) => queries.insertOrUpdateLnurlW(lnurlW)))
  }
  if (data.cards != null) {
    await Promise.all(data.cards.map((card) => queries.insertOrUpdateCard(card)))
  }
  if (data.cardVersions != null) {
    await Promise.all(data.cardVersions.map((cardVersion) => queries.insertOrUpdateLatestCardVersion(cardVersion)))
  }
  if (data.invoices != null) {
    await Promise.all(
      data.invoices.map((invoice) => queries.insertOrUpdateInvoice(invoice)),
    )
  }
  if (data.cardVersionInvoices != null) {
    await Promise.all(
      data.cardVersionInvoices.map((cardVersionInvoice) => queries.insertOrUpdateCardVersionInvoice(cardVersionInvoice)),
    )
  }
  if (data.setSettings != null) {
    await Promise.all(data.setSettings.map((setSettings) => queries.insertOrUpdateSetSettings(setSettings)))
  }
  if (data.usersCanUseSets != null) {
    await Promise.all(data.usersCanUseSets.map((userCanUseSet) => queries.insertOrUpdateUserCanUseSet(userCanUseSet)))
  }
  if (data.users != null) {
    await Promise.all(data.users.map((user) => queries.insertOrUpdateUser(user)))
  }
  if (data.profiles != null) {
    await Promise.all(data.profiles.map((profile) => queries.insertOrUpdateProfile(profile)))
  }
  if (data.allowedRefreshTokens != null) {
    await Promise.all(data.allowedRefreshTokens.map((allowedRefreshTokens) => queries.insertOrUpdateAllowedRefreshTokens(allowedRefreshTokens)))
  }
}

/** @throws */
export const deleteDataObjects = async (queries: Queries, data: DataObjects): Promise<void> => {
  if (data.cardVersionInvoices != null) {
    await Promise.all(
      data.cardVersionInvoices.map((cardVersionInvoice) => queries.deleteCardVersionInvoice(cardVersionInvoice)),
    )
  }
  if (data.invoices != null) {
    await Promise.all(
      data.invoices.map((invoice) => queries.deleteInvoice(invoice)),
    )
  }
  if (data.cardVersions != null) {
    await Promise.all(data.cardVersions.map((cardVersion) => queries.deleteCardVersion(cardVersion)))
  }
  if (data.cards != null) {
    await Promise.all(data.cards.map((card) => queries.deleteCard(card)))
  }
  if (data.usersCanUseSets != null) {
    await Promise.all(data.usersCanUseSets.map((userCanUseSet) => queries.deleteUserCanUseSet(userCanUseSet)))
  }
  if (data.setSettings != null) {
    await Promise.all(data.setSettings.map((setSettings) => queries.deleteSetSettings(setSettings)))
  }
  if (data.sets != null) {
    await Promise.all(data.sets.map((set) => queries.deleteSet(set)))
  }
}

const makeSureOnlyASingleVersionExistsPerCard = async (queries: Queries, data: DataObjects): Promise<void> => {
  if (data.cardVersions == null) {
    return
  }
  await Promise.all(data.cardVersions.map(async (cardVersion) => {
    const latestCardVersion = await queries.getLatestCardVersion(cardVersion.card)
    if (latestCardVersion == null) {
      return
    }
    updateCardVersionId(data, cardVersion.id, latestCardVersion.id)
  }))
}

const updateCardVersionId = (data: DataObjects, currentId: string, newId: string) => {
  data.cardVersions?.forEach((cardVersion) => {
    if (cardVersion.id === currentId) {
      cardVersion.id = newId
    }
  })
  data.cardVersionInvoices?.forEach((cardVersionInvoice) => {
    if (cardVersionInvoice.cardVersion === currentId) {
      cardVersionInvoice.cardVersion = newId
    }
  })
}
