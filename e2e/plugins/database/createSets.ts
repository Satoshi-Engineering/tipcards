import type { SetDto } from '@shared/data/trpc/SetDto'

import { createHash, randomUUID } from 'crypto'
import type { Sql } from 'postgres'

import type { CardVersion, Invoice } from '../../../backend/src/database/schema/index'

export const create100TestSets = async (sql: Sql, userId: string): Promise<SetDto[]> => {
  const set1 = await createSet001(sql, userId)
  const set2 = await createSet002(sql, userId)
  const set3 = await createSet003(sql, userId)
  const set4 = await createSet004(sql, userId)
  const set5 = await createSet005(sql, userId)
  const set6 = await createSet006(sql, userId)
  const setsWithSetFunding = await createSetsWithSetFunding(sql, userId, 94, 100)
  return [set1, set2, set3, set4, set5, set6, ...setsWithSetFunding]
}

// funded by invoice: 1 card
export const createSet001 = async (sql: Sql, userId: string): Promise<SetDto> => {
  const set = await createSet(sql, userId, 'Set 001', 1)
  await createInvoiceFundedCards(sql, set, [1])
  return set
}

// unfunded: 1 card
// lnurlp funding: 1 card
// funded by invoice: 1 card
// withdrawn: 1 card
export const createSet002 = async (sql: Sql, userId: string): Promise<SetDto> => {
  const set = await createSet(sql, userId, 'Set 002', 4)
  await createWithdrawnCards(sql, set, [1])
  await createInvoiceFundedCards(sql, set, [2])
  await createCardWithLnurlp(sql, set, 3)
  return set
}

// unfunded: 3 card
// lnurlp funding: 1 card
// funded by invoice: 5 card
// withdrawn: 3 card
export const createSet003 = async (sql: Sql, userId: string): Promise<SetDto> => {
  const set = await createSet(sql, userId, 'Set 003', 12)
  await createWithdrawnCards(sql, set, [1, 4, 12])
  await createInvoiceFundedCards(sql, set, [2, 3, 5, 6, 11])
  await createCardWithLnurlp(sql, set, 7)
  return set
}

// unfunded: 4 card
// lnurlp funding: 1 card
// funded by invoice: 5 card
// withdrawn: 3 card
export const createSet004 = async (sql: Sql, userId: string): Promise<SetDto> => {
  const set = await createSet(sql, userId, 'Set 004', 13)
  await createWithdrawnCards(sql, set, [1, 4, 12])
  await createInvoiceFundedCards(sql, set, [2, 3, 5, 6, 11])
  await createCardWithLnurlp(sql, set, 7)
  return set
}

// locked by bulkwithdraw: 30
// withdrawn: 19 card
export const createSet005 = async (sql: Sql, userId: string): Promise<SetDto> => {
  const set = await createSet(sql, userId, 'Set 005', 49)
  const indexes = [...Array(50).keys()]
  await createWithdrawnCards(sql, set, indexes.slice(1, 20))
  await createCardsLockedByBulkWithdraw(sql, set, indexes.slice(20, 50))
  return set
}

// unfunded: 5 card
// invoice funding: 4 card
// funded by invoice: 80 card
// withdrawn: 10 card
export const createSet006 = async (sql: Sql, userId: string): Promise<SetDto> => {
  const set = await createSet(sql, userId, 'Set 006', 99)
  const indexes = [...Array(100).keys()]
  await createWithdrawnCards(sql, set, indexes.slice(1, 11))
  await createInvoiceFundedCards(sql, set, indexes.slice(11, 91))
  await createCardsWithInvoice(sql, set, indexes.slice(91, 95))
  return set
}

export const createSetsWithSetFunding = async (
  sql: Sql,
  userId: string,
  numberOfSets: number,
  numberOfCardsPerSet: number,
): Promise<SetDto[]> => {
  const setValues = [...Array(numberOfSets).keys()].map(() => {
    const created = createRandomTimestampLastYear()
    return {
      id: randomUUID(),
      created,
      changed: created,
    }
  })
  await sql`INSERT INTO public."Set" ${ sql(setValues) };`

  const setSettingValues = setValues.map((set, index) => ({
    set: set.id,
    name: `BulkSet ${String(index + 1).padStart(3, '0')}`,
    numberOfCards: numberOfCardsPerSet,
    cardHeadline: `${set.id} cardHeadline`,
    cardCopytext: `${set.id} cardCopytext`,
    image: 'bitcoin',
    landingPage: 'default',
  }))
  await sql`INSERT INTO public."SetSettings" ${ sql(setSettingValues) };`

  const userCanUseSetValues = setValues.map((set) => ({
    user: userId,
    set: set.id,
    canEdit: true,
  }))
  await sql`INSERT INTO public."UserCanUseSet" ${ sql(userCanUseSetValues) };`

  await Promise.all(setValues.map(async (set) => {
    const cardValues = [...new Array(numberOfCardsPerSet).keys()].map((index) => ({
      hash: hashSha256(`${set.id}/${index}`),
      created: set.created,
      set: set.id,
    }))
    await sql`INSERT INTO public."Card" ${ sql(cardValues) };`

    const cardVersionValues = cardValues.map((card) => ({
      id: randomUUID(),
      card: card.hash,
      created: set.created,
      lnurlP: null,
      lnurlW: null,
      textForWithdraw: '',
      noteForStatusPage: '',
      sharedFunding: false,
      landingPageViewed: null,
    }))
    await sql`INSERT INTO public."CardVersion" ${ sql(cardVersionValues) };`

    const invoiceValues = {
      amount: 21 * numberOfCardsPerSet,
      paymentHash: randomUUID(),
      paymentRequest: randomUUID(),
      created: set.created,
      paid: null,
      expiresAt: new Date(set.created.getTime() + 1000 * 60 * 5),
      extra: '',
    }
    await sql`INSERT INTO public."Invoice" ${ sql(invoiceValues) };`

    const cardVersionHasInvoiceValues = cardVersionValues.map((cardVersion) => ({
      cardVersion: cardVersion.id,
      invoice: invoiceValues.paymentHash,
    }))
    await sql`INSERT INTO public."CardVersionHasInvoice" ${ sql(cardVersionHasInvoiceValues) };`
  }))

  return setValues.map((set, index) => ({
    ...set,
    settings: setSettingValues[index],
  }))
}

const createSet = async (
  sql: Sql,
  userId: string,
  name: string,
  numberOfCards: number,
): Promise<SetDto> => {
  const created = createRandomTimestampLastYear()
  const set = {
    id: randomUUID(),
    created,
    changed: created,
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

  return {
    ...set,
    settings: setSettings,
  }
}

const createWithdrawnCards = async (
  sql: Sql,
  set: SetDto,
  indexes: number[],
) => {
  const { cardVersions, invoice } = await createInvoiceFundedCards(sql, set, indexes)

  const lnurlWs = cardVersions.map(() => {
    const created = createRandomTimestampBetweenDateAndNow(invoice.created)
    const withdrawn = createRandomTimestampBetweenDateAndNow(created)
    return {
      lnbitsId: randomUUID(),
      created,
      expiresAt: new Date(created.getTime() + 1000 * 60 * 5),
      withdrawn,
      bulkWithdrawId: null,
    }
  })
  await sql`INSERT INTO public."LnurlW" ${ sql(lnurlWs) };`

  await Promise.all(cardVersions.map(async (cardVersion, index) => {
    await sql`UPDATE public."CardVersion" SET "lnurlW" = ${ lnurlWs[index].lnbitsId } WHERE id = ${ cardVersion.id };`
  }))
}

const createCardsLockedByBulkWithdraw = async (
  sql: Sql,
  set: SetDto,
  indexes: number[],
) => {
  const { cardVersions, invoice } = await createInvoiceFundedCards(sql, set, indexes)
  const created = createRandomTimestampBetweenDateAndNow(invoice.created)

  const lnurlW = {
    lnbitsId: randomUUID(),
    created,
    expiresAt: new Date(created.getTime() + 1000 * 60 * 5),
    withdrawn: null,
    bulkWithdrawId: randomUUID(),
  }
  await sql`INSERT INTO public."LnurlW" ${ sql(lnurlW) };`

  const cardVersionIds = cardVersions.map((cardVersion) => cardVersion.id)
  await sql`UPDATE public."CardVersion" SET "lnurlW" = ${ lnurlW.lnbitsId } WHERE id IN ${ sql(cardVersionIds) };`
}

const createInvoiceFundedCards = async (
  sql: Sql,
  set: SetDto,
  indexes: number[],
): Promise<{ cardVersions: CardVersion[], invoice: Invoice }> => {
  const cardVersions = await createUnfundedCards(sql, set, indexes)
  const latestCardVersion = cardVersions.sort((a, b) => b.created.getTime() - a.created.getTime())[0]
  const created = createRandomTimestampBetweenDateAndNow(latestCardVersion.created)

  const invoice = {
    amount: 210 * indexes.length,
    paymentHash: randomUUID(),
    paymentRequest: randomUUID(),
    created,
    paid: created,
    expiresAt: new Date(created.getTime() + 1000 * 60 * 5),
    extra: '',
  }
  await sql`INSERT INTO public."Invoice" ${ sql(invoice) };`

  const cardVersionHasInvoiceValues = cardVersions.map((cardVersion) => ({
    cardVersion: cardVersion.id,
    invoice: invoice.paymentHash,
  }))
  await sql`INSERT INTO public."CardVersionHasInvoice" ${ sql(cardVersionHasInvoiceValues) };`

  return {
    cardVersions,
    invoice,
  }
}

const createCardWithLnurlp = async (
  sql: Sql,
  set: SetDto,
  index: number,
) => {
  const [cardVersion] = await createUnfundedCards(sql, set, [index])
  const created = createRandomTimestampBetweenDateAndNow(cardVersion.created)

  const lnurlP = {
    lnbitsId: randomUUID(),
    created,
    expiresAt: new Date(created.getTime() + 1000 * 60 * 5),
    finished: null,
  }
  await sql`INSERT INTO public."LnurlP" ${ sql(lnurlP) };`

  const cardVersionId = cardVersion.id
  await sql`UPDATE public."CardVersion" SET "lnurlP" = ${ lnurlP.lnbitsId } WHERE id = ${ cardVersionId };`
}

const createCardsWithInvoice = async (
  sql: Sql,
  set: SetDto,
  indexes: number[],
) => {
  const cardVersions = await createUnfundedCards(sql, set, indexes)

  const values = cardVersions.map((cardVersion) => {
    const created = createRandomTimestampBetweenDateAndNow(cardVersion.created)
    const invoice = {
      amount: 210,
      paymentHash: randomUUID(),
      paymentRequest: randomUUID(),
      created,
      paid: created,
      expiresAt: new Date(created.getTime() + 1000 * 60 * 5),
      extra: '',
    }
    const cardVersionHasInvoice = {
      cardVersion: cardVersion.id,
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
  set: SetDto,
  indexes: number[],
): Promise<CardVersion[]> => {
  const cardValues = indexes.map((index) => ({
    hash: hashSha256(`${set.id}/${index}`),
    created: createRandomTimestampBetweenDateAndNow(set.created),
    set: set.id,
  }))
  await sql`INSERT INTO public."Card" ${ sql(cardValues) };`

  const cardVersionValues = cardValues.map((card) => ({
    id: randomUUID(),
    card: card.hash,
    created: card.created,
    lnurlP: null,
    lnurlW: null,
    textForWithdraw: '',
    noteForStatusPage: '',
    sharedFunding: false,
    landingPageViewed: null,
  }))
  await sql`INSERT INTO public."CardVersion" ${ sql(cardVersionValues) };`

  return cardVersionValues
}

const hashSha256 = (message: string) => {
  const messageBuffer = Buffer.from(message)
  const hash = createHash('sha256').update(messageBuffer).digest('hex')
  return hash
}

const createRandomTimestampLastYear = () => new Date(new Date().getTime() - Math.floor(Math.random() * 1000 * 60 * 60 * 24 * 365))

const createRandomTimestampBetweenDateAndNow = (date: Date) => new Date(date.getTime() + Math.floor(Math.random() * (new Date().getTime() - date.getTime())))
