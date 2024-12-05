import { createHash, randomUUID } from 'crypto'
import type { Sql } from 'postgres'

export const createSets = async (sql: Sql, userId: string) => {
  await createSet001(sql, userId)
  await createSet002(sql, userId)
  await createSet003(sql, userId)
  await createSet004(sql, userId)
  await createSet005(sql, userId)
  await createSet006(sql, userId)
}

// funded by invoice: 1 card
const createSet001 = async (sql: Sql, userId: string) => {
  const setId = await createSet(sql, userId, 'Set 001', 1)
  await createInvoiceFundedCards(sql, setId, [1])
}

// unfunded: 1 card
// lnurlp funding: 1 card
// funded by invoice: 1 card
// withdrawn: 1 card
const createSet002 = async (sql: Sql, userId: string) => {
  const setId = await createSet(sql, userId, 'Set 002', 4)
  await createWithdrawnCards(sql, setId, [1])
  await createInvoiceFundedCards(sql, setId, [2])
  await createCardWithLnurlp(sql, setId, 3)
}

// unfunded: 3 card
// lnurlp funding: 1 card
// funded by invoice: 5 card
// withdrawn: 3 card
const createSet003 = async (sql: Sql, userId: string) => {
  const setId = await createSet(sql, userId, 'Set 003', 12)
  await createWithdrawnCards(sql, setId, [1, 4, 12])
  await createInvoiceFundedCards(sql, setId, [2, 3, 5, 6, 11])
  await createCardWithLnurlp(sql, setId, 7)
}

// unfunded: 4 card
// lnurlp funding: 1 card
// funded by invoice: 5 card
// withdrawn: 3 card
const createSet004 = async (sql: Sql, userId: string) => {
  const setId = await createSet(sql, userId, 'Set 004', 13)
  await createWithdrawnCards(sql, setId, [1, 4, 12])
  await createInvoiceFundedCards(sql, setId, [2, 3, 5, 6, 11])
  await createCardWithLnurlp(sql, setId, 7)
}

// locked by bulkwithdraw: 30
// withdrawn: 19 card
const createSet005 = async (sql: Sql, userId: string) => {
  const setId = await createSet(sql, userId, 'Set 005', 49)
  const indexes = [...Array(50).keys()]
  await createWithdrawnCards(sql, setId, indexes.slice(1, 20))
  await createCardsLockedByBulkWithdraw(sql, setId, indexes.slice(20, 50))
}

// unfunded: 5 card
// invoice funding: 4 card
// funded by invoice: 80 card
// withdrawn: 10 card
const createSet006 = async (sql: Sql, userId: string) => {
  const setId = await createSet(sql, userId, 'Set 006', 99)
  const indexes = [...Array(100).keys()]
  await createWithdrawnCards(sql, setId, indexes.slice(1, 11))
  await createInvoiceFundedCards(sql, setId, indexes.slice(11, 91))
  await createCardsWithInvoice(sql, setId, indexes.slice(91, 95))
}

const createSet = async (
  sql: Sql,
  userId: string,
  name: string,
  numberOfCards: number,
) => {
  const set = {
    id: randomUUID(),
    created: new Date(),
    changed: new Date(),
  }
  await sql`INSERT INTO public."Set" ${ sql(set) };`

  const setSettings = {
    set: set.id,
    name,
    numberOfCards,
    cardHeadline: `${name} cardHeadline`,
    cardCopytext: `${name} cardCopytext`,
    image: 'bitcoin',
    landingPage: 'default',
  }
  await sql`INSERT INTO public."SetSettings" ${ sql(setSettings) };`

  const userCanUseSet = {
    user: userId,
    set: set.id,
    canEdit: true,
  }
  await sql`INSERT INTO public."UserCanUseSet" ${ sql(userCanUseSet) };`

  return set.id
}

const createWithdrawnCards = async (
  sql: Sql,
  setId: string,
  indexes: number[],
) => {
  const cardVersionIds = await createInvoiceFundedCards(sql, setId, indexes)

  const lnurlW = {
    lnbitsId: randomUUID(),
    created: new Date(),
    expiresAt: new Date(new Date().getTime() + 1000 * 60 * 5),
    withdrawn: new Date(),
    bulkWithdrawId: null,
  }
  await sql`INSERT INTO public."LnurlW" ${ sql(lnurlW) };`
  await sql`UPDATE public."CardVersion" SET lnurlW = ${ sql(lnurlW.lnbitsId) } WHERE id IN ${ sql(cardVersionIds) };`
}

const createCardsLockedByBulkWithdraw = async (
  sql: Sql,
  setId: string,
  indexes: number[],
) => {
  const cardVersionIds = await createInvoiceFundedCards(sql, setId, indexes)

  const lnurlW = {
    lnbitsId: randomUUID(),
    created: new Date(),
    expiresAt: new Date(new Date().getTime() + 1000 * 60 * 5),
    withdrawn: null,
    bulkWithdrawId: randomUUID(),
  }
  await sql`INSERT INTO public."LnurlW" ${ sql(lnurlW) };`
  await sql`UPDATE public."CardVersion" SET lnurlW = ${ sql(lnurlW.lnbitsId) } WHERE id IN ${ sql(cardVersionIds) };`
}

const createInvoiceFundedCards = async (
  sql: Sql,
  setId: string,
  indexes: number[],
) => {
  const cardVersionIds = await createUnfundedCards(sql, setId, indexes)

  const invoice = {
    amount: 210 * indexes.length,
    paymentHash: randomUUID(),
    paymentRequest: randomUUID(),
    created: new Date(),
    paid: new Date(),
    expiresAt: new Date(new Date().getTime() + 1000 * 60 * 5),
    extra: '',
  }
  await sql`INSERT INTO public."Invoice" ${ sql(invoice) };`

  const cardVersionHasInvoiceValues = cardVersionIds.map((cardVersionId) => ({
    cardVersion: cardVersionId,
    invoice: invoice.paymentHash,
  }))
  await sql`INSERT INTO public."CardVersionHasInvoice" ${ sql(cardVersionHasInvoiceValues) };`

  return cardVersionIds
}

const createCardWithLnurlp = async (
  sql: Sql,
  setId: string,
  index: number,
) => {
  const cardVersionId = await createUnfundedCards(sql, setId, [index])

  const lnurlP = {
    lnbitsId: randomUUID(),
    created: new Date(),
    expiresAt: new Date(new Date().getTime() + 1000 * 60 * 5),
    finished: null,
  }
  await sql`INSERT INTO public."LnurlP" ${ sql(lnurlP) };`
  await sql`UPDATE public."CardVersion" SET lnurlP = ${ sql(lnurlP.lnbitsId) } WHERE id = ${ sql(cardVersionId) };`
}

const createCardsWithInvoice = async (
  sql: Sql,
  setId: string,
  indexes: number[],
) => {
  const cardVersionIds = await createUnfundedCards(sql, setId, indexes)

  const values = cardVersionIds.map((cardVersionId) => {
    const invoice = {
      amount: 210,
      paymentHash: randomUUID(),
      paymentRequest: randomUUID(),
      created: new Date(),
      paid: new Date(),
      expiresAt: new Date(new Date().getTime() + 1000 * 60 * 5),
      extra: '',
    }
    const cardVersionHasInvoice = {
      cardVersion: cardVersionId,
      invoice: invoice.paymentHash,
    }
    return {
      invoice,
      cardVersionHasInvoice,
    }
  })

  const invoiceValues = values.map((value) => value.invoice)
  await sql`INSERT INTO public."Invoice" ${ sql(invoiceValues) };`

  const cardVersionHasInvoiceValues = values.map((value) => value.cardVersionHasInvoice)
  await sql`INSERT INTO public."CardVersionHasInvoice" ${ sql(cardVersionHasInvoiceValues) };`
}

const createUnfundedCards = async (
  sql: Sql,
  setId: string,
  indexes: number[],
) => {
  const cardValues = indexes.map((index) => ({
    hash: hashSha256(`${setId}/${index}`),
    created: new Date(),
    set: setId,
  }))
  await sql`INSERT INTO public."Card" ${ sql(cardValues) };`

  const cardVersionValues = cardValues.map((card) => ({
    id: randomUUID(),
    card: card.hash,
    created: new Date(),
    lnurlP: null,
    lnurlW: null,
    textForWithdraw: '',
    noteForStatusPage: '',
    sharedFunding: false,
    landingPageViewed: null,
  }))
  await sql`INSERT INTO public."CardVersion" ${ sql(cardVersionValues) };`

  return cardVersionValues.map((cardVersion) => cardVersion.id)
}

const hashSha256 = (message: string) => {
  const messageBuffer = Buffer.from(message)
  const hash = createHash('sha256').update(messageBuffer).digest('hex')
  return hash
}
