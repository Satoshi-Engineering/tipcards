import type { SetDto } from '@shared/data/trpc/SetDto'

import { createHash, randomUUID } from 'crypto'
import type { Sql } from 'postgres'

import type { CardVersion, Invoice, LnurlP } from '../../../backend/src/database/schema/index'

// these are copies of the functions from @shared because importing from there does not work
const FEE_PERCENTAGE = 0.01
const calculateFeeForNetAmount = (amountInSats: number): number => Math.ceil(amountInSats * FEE_PERCENTAGE)

export const createCardsWithSetFunding = async (
  sql: Sql,
  set: Pick<SetDto, 'id' | 'created'>,
  numberOfCards: number,
) => {
  const cardValues = [...new Array(numberOfCards).keys()].map((index) => ({
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
    amount: 21 * numberOfCards,
    feeAmount: calculateFeeForNetAmount(21) * numberOfCards,
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
}

export const createWithdrawnCards = async (
  sql: Sql,
  set: SetDto,
  indexes: number[],
) => {
  const { cardVersions, invoice } = await createCardsFundedByBulkFunding(sql, set, indexes)

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

export const createCardsLockedByBulkWithdraw = async (
  sql: Sql,
  set: SetDto,
  indexes: number[],
) => {
  const { cardVersions, invoice } = await createCardsFundedByBulkFunding(sql, set, indexes)
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

export const createCardsFundedByBulkFunding = async (
  sql: Sql,
  set: SetDto,
  indexes: number[],
): Promise<{ cardVersions: CardVersion[], invoice: Invoice }> => {
  const cardVersions = await createUnfundedCards(sql, set, indexes)
  const latestCardVersion = cardVersions.sort((a, b) => b.created.getTime() - a.created.getTime())[0]
  const created = createRandomTimestampBetweenDateAndNow(latestCardVersion.created)

  const invoice = {
    amount: 210 * indexes.length,
    feeAmount: calculateFeeForNetAmount(210) * indexes.length,
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

export const createCardWithLnurlp = async (
  sql: Sql,
  set: SetDto,
  index: number,
) => {
  const [cardVersion] = await createUnfundedCards(sql, set, [index])
  const created = createRandomTimestampBetweenDateAndNow(cardVersion.created)

  const lnurlP: LnurlP = {
    lnbitsId: randomUUID(),
    created,
    expiresAt: null,
    finished: null,
  }
  await sql`INSERT INTO public."LnurlP" ${ sql(lnurlP) };`

  const cardVersionId = cardVersion.id
  await sql`UPDATE public."CardVersion" SET "lnurlP" = ${ lnurlP.lnbitsId } WHERE id = ${ cardVersionId };`
}

export const createCardWithSharedFunding = async (
  sql: Sql,
  set: SetDto,
  index: number,
) => {
  const cardVersion = await createUnfundedCardForSharedFunding(sql, set, index)
  const created = createRandomTimestampBetweenDateAndNow(cardVersion.created)

  const lnurlP: LnurlP = {
    lnbitsId: randomUUID(),
    created,
    expiresAt: null,
    finished: null,
  }
  await sql`INSERT INTO public."LnurlP" ${ sql(lnurlP) };`

  const cardVersionId = cardVersion.id
  await sql`UPDATE public."CardVersion" SET "lnurlP" = ${ lnurlP.lnbitsId } WHERE id = ${ cardVersionId };`

  return cardVersion
}

export const createCardWithSharedFundingPartiallyFunded = async (
  sql: Sql,
  set: SetDto,
  index: number,
) => {
  const cardVersion = await createCardWithSharedFunding(sql, set, index)
  const created = createRandomTimestampBetweenDateAndNow(cardVersion.created)

  const invoice = {
    amount: 210,
    feeAmount: calculateFeeForNetAmount(210),
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

  await sql`INSERT INTO public."Invoice" ${ sql(invoice) };`
  await sql`INSERT INTO public."CardVersionHasInvoice" ${ sql(cardVersionHasInvoice) };`
}

export const createUnfundedCardsWithInvoice = async (
  sql: Sql,
  set: SetDto,
  indexes: number[],
) => {
  const cardVersions = await createUnfundedCards(sql, set, indexes)

  const values = cardVersions.map((cardVersion) => {
    const created = new Date()
    const invoice = {
      amount: 210,
      feeAmount: calculateFeeForNetAmount(210),
      paymentHash: randomUUID(),
      paymentRequest: randomUUID(),
      created,
      paid: null,
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

export const createCardsWithExpiredInvoice = async (
  sql: Sql,
  set: SetDto,
  indexes: number[],
) => {
  const cardVersions = await createUnfundedCards(sql, set, indexes)

  const values = cardVersions.map((cardVersion) => {
    const created = createRandomTimestampBetweenDateAndNow(cardVersion.created)
    const invoice = {
      amount: 210,
      feeAmount: calculateFeeForNetAmount(210),
      paymentHash: randomUUID(),
      paymentRequest: randomUUID(),
      created,
      paid: null,
      expiresAt: created,
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

export const createCardsFundedByInvoice = async (
  sql: Sql,
  set: SetDto,
  indexes: number[],
) => {
  const cardVersions = await createUnfundedCards(sql, set, indexes)

  const values = cardVersions.map((cardVersion) => {
    const created = createRandomTimestampBetweenDateAndNow(cardVersion.created)
    const invoice = {
      amount: 210,
      feeAmount: calculateFeeForNetAmount(210),
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

const createUnfundedCardForSharedFunding = async (
  sql: Sql,
  set: SetDto,
  index: number,
): Promise<CardVersion> => {
  const card = {
    hash: hashSha256(`${set.id}/${index}`),
    created: createRandomTimestampBetweenDateAndNow(set.created),
    set: set.id,
  }
  await sql`INSERT INTO public."Card" ${ sql(card) };`

  const cardVersion = {
    id: randomUUID(),
    card: card.hash,
    created: card.created,
    lnurlP: null,
    lnurlW: null,
    textForWithdraw: '',
    noteForStatusPage: '',
    sharedFunding: true,
    landingPageViewed: null,
  }
  await sql`INSERT INTO public."CardVersion" ${ sql(cardVersion) };`

  return cardVersion
}

const hashSha256 = (message: string) => {
  const messageBuffer = Buffer.from(message)
  const hash = createHash('sha256').update(messageBuffer).digest('hex')
  return hash
}

export const generateCardHashForSet = (setId: string, cardIndex: number) => hashSha256(`${setId}/${cardIndex}`)

export const createRandomTimestampLastYear = () => new Date(new Date().getTime() - Math.floor(Math.random() * 1000 * 60 * 60 * 24 * 365))

const createRandomTimestampBetweenDateAndNow = (date: Date) => new Date(date.getTime() + Math.floor(Math.random() * (new Date().getTime() - date.getTime())))
