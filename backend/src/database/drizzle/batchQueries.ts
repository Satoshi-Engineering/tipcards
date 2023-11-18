import {
  Card, CardVersion,
  Invoice, CardVersionHasInvoice,
  LnurlP, LnurlW,
} from '@backend/database/drizzle/schema'
import {
  insertCards, insertCardVersions,
  insertInvoices, insertCardVersionInvoices,
  insertLnurlPs, insertLnurlWs,
  updateCardVesion,
  insertOrUpdateInvoice, insertOrUpdateCardVersionInvoice,
  insertOrUpdateLnurlP, insertOrUpdateLnurlW,
  deleteCard, deleteCardVersion,
  deleteInvoice, deleteCardVersionInvoice,
} from '@backend/database/drizzle/queries'

export type DataObjectsForInsert = {
  card: Card,
  cardVersion: CardVersion,
  lnurlP?: LnurlP | null,
  lnurlW?: LnurlW | null,
  invoice?: Invoice | null,
  cardVersionInvoice?: CardVersionHasInvoice | null,
}

/** @throws */
export const insertDataObjects = async (data: DataObjectsForInsert): Promise<void> => {
  if (data.lnurlP != null) {
    await insertLnurlPs(data.lnurlP)
  }
  if (data.lnurlW != null) {
    await insertLnurlWs(data.lnurlW)
  }
  await insertCards(data.card)
  await insertCardVersions(data.cardVersion)
  if (data.invoice != null) {
    await insertInvoices(data.invoice)
  }
  if (data.cardVersionInvoice != null) {
    await insertCardVersionInvoices(data.cardVersionInvoice)
  }
}

export type DataObjectsForInsertOrUpdate = {
  cardVersion: CardVersion,
  invoices: { invoice: Invoice, cardVersionInvoice: CardVersionHasInvoice }[],
  lnurlP?: LnurlP | null,
  lnurlW?: LnurlW | null,
}

export const insertOrUpdateDataObjects = async (data: DataObjectsForInsertOrUpdate): Promise<void> => {
  if (data.lnurlP != null) {
    await insertOrUpdateLnurlP(data.lnurlP)
  }
  if (data.lnurlW != null) {
    await insertOrUpdateLnurlW(data.lnurlW)
  }
  await updateCardVesion(data.cardVersion)
  await Promise.all(data.invoices.map(async ({ invoice, cardVersionInvoice }) => {
    await insertOrUpdateInvoice(invoice)
    await insertOrUpdateCardVersionInvoice(cardVersionInvoice)
  }))
}

export type DataObjectsForDelete = {
  card?: Card,
  cardVersion?: CardVersion,
  cardVersionInvoices?: CardVersionHasInvoice[],
  invoices?: { invoice: Invoice, cardVersionInvoice: CardVersionHasInvoice }[],
}

export const deleteDataObjects = async (data: DataObjectsForDelete): Promise<void> => {
  if (data.cardVersionInvoices != null) {
    await Promise.all(
      data.cardVersionInvoices.map((cardVersionInvoice) => deleteCardVersionInvoice(cardVersionInvoice)),
    )
  }
  if (data.invoices != null) {
    await Promise.all(data.invoices.map(async ({ invoice, cardVersionInvoice }) => {
      await deleteCardVersionInvoice(cardVersionInvoice)
      await deleteInvoice(invoice)
    }))
  }
  if (data.cardVersion != null) {
    await deleteCardVersion(data.cardVersion)
  }
  if (data.card != null) {
    await deleteCard(data.card)
  }
}
