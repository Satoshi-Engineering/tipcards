import { getClient } from '@backend/database/drizzle/client'

import { Card } from '@backend/database/drizzle/schema/Card'
import { CardVersion } from '@backend/database/drizzle/schema/CardVersion'
import { CardVersionHasInvoice } from '@backend/database/drizzle/schema/CardVersionHasInvoice'
import { Invoice } from '@backend/database/drizzle/schema/Invoice'
import { LnurlP } from '@backend/database/drizzle/schema/LnurlP'
import { LnurlW } from '@backend/database/drizzle/schema/LnurlW'

export const addData = async ({
  cards,
  cardVersions,
  invoices,
  cardVersionInvoices,
  lnurlps,
  lnurlws,
}: {
  cards?: Card[],
  cardVersions?: CardVersion[],
  invoices?: Invoice[],
  cardVersionInvoices?: CardVersionHasInvoice[],
  lnurlps?: LnurlP[],
  lnurlws?: LnurlW[],
}) => {
  await addCards(cards)
  await addCardVersions(cardVersions)
  await addInvoices(invoices)
  await addCardVersionInvoices(cardVersionInvoices)
  await addLnurlPs(lnurlps)
  await addLnurlWs(lnurlws)
}

export const addCards = async (cards: Card[] | undefined): Promise<void> => {
  if (cards == null) {
    return
  }
  const client = await getClient()
  await client.insert(Card)
    .values(cards)
}

export const addCardVersions = async (cardVersions: CardVersion[] | undefined): Promise<void> => {
  if (cardVersions == null) {
    return
  }
  const client = await getClient()
  await client.insert(CardVersion)
    .values(cardVersions)
}

export const addInvoices = async (invoices: Invoice[] | undefined): Promise<void> => {
  if (invoices == null) {
    return
  }
  const client = await getClient()
  await client.insert(Invoice)
    .values(invoices)
}

export const addCardVersionInvoices = async (cardVersionInvoices: CardVersionHasInvoice[] | undefined): Promise<void> => {
  if (cardVersionInvoices == null) {
    return
  }
  const client = await getClient()
  await client.insert(CardVersionHasInvoice)
    .values(cardVersionInvoices)
}

export const addLnurlPs = async (lnurlps: LnurlP[] | undefined): Promise<void> => {
  if (lnurlps == null) {
    return
  }
  const client = await getClient()
  await client.insert(LnurlP)
    .values(lnurlps)
}

export const addLnurlWs = async (lnurlws: LnurlW[] | undefined): Promise<void> => {
  if (lnurlws == null) {
    return
  }
  const client = await getClient()
  await client.insert(LnurlW)
    .values(lnurlws)
}
