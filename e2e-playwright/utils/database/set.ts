import type { SetDto } from '@shared/data/trpc/SetDto'

import { randomUUID } from 'crypto'
import type { Sql } from 'postgres'

import {
  createCardsFundedByBulkFunding,
  createCardsFundedByInvoice,
  createCardsLockedByBulkWithdraw,
  createCardsWithExpiredInvoice,
  createCardsWithSetFunding,
  createCardWithLnurlp,
  createCardWithSharedFunding,
  createCardWithSharedFundingPartiallyFunded,
  createRandomTimestampLastYear,
  createUnfundedCardsWithInvoice,
  createWithdrawnCards,
  generateCardHashForSet,
} from './setCardFixtures'
import getSqlClient from './sqlClient'

export const create100TestSets = async (userId: string): Promise<SetDto[]> => {
  const sql = getSqlClient()
  const set1 = await createSet001(sql, userId)
  const set2 = await createSet002(sql, userId)
  const set3 = await createSet003(sql, userId)
  const set4 = await createSet004(sql, userId)
  const set5 = await createSet005(sql, userId)
  const set6 = await createSet006(sql, userId)
  const set7 = await createSet007(sql, userId)
  const setsWithSetFunding = await createSetsWithSetFunding(userId, 93, 100)
  return [set1, set2, set3, set4, set5, set6, set7, ...setsWithSetFunding]
}

export const createSetWithCardStatusExamples = async (userId: string): Promise<SetDto> => {
  const sql = getSqlClient()
  return await createSet002(sql, userId)
}

export const createHistoryUpdateTestData = async (userId: string): Promise<SetDto> => {
  const sql = getSqlClient()
  await createSet001(sql, userId)
  return await createSet002(sql, userId)
}

export const setFundedCardToLandingPageViewed = async (setId: string, cardIndex: number) => {
  const sql = getSqlClient()
  const cardHash = generateCardHashForSet(setId, cardIndex)
  await sql`UPDATE public."CardVersion" SET "landingPageViewed" = ${ new Date() } WHERE card = ${ cardHash };`
}

// funded by invoice: 1 card
const createSet001 = async (sql: Sql, userId: string): Promise<SetDto> => {
  const set = await createSet(sql, userId, 'Set 001', 1)
  await createCardsFundedByInvoice(sql, set, [0])
  return set
}

// unfunded: 1 card
// lnurlp funding: 1 card
// funded by invoice: 1 card
// withdrawn: 1 card
const createSet002 = async (sql: Sql, userId: string): Promise<SetDto> => {
  const set = await createSet(sql, userId, 'Set 002', 4)
  await createWithdrawnCards(sql, set, [1])
  await createCardsFundedByInvoice(sql, set, [2])
  await createCardWithLnurlp(sql, set, 3)
  return set
}

// unfunded: 3 card
// lnurlp funding: 1 card
// funded by invoice: 5 card
// withdrawn: 3 card
const createSet003 = async (sql: Sql, userId: string): Promise<SetDto> => {
  const set = await createSet(sql, userId, 'Set 003', 12)
  await createWithdrawnCards(sql, set, [1, 4, 12])
  await createCardsFundedByInvoice(sql, set, [2, 3, 5, 6, 11])
  await createCardWithLnurlp(sql, set, 7)
  return set
}

// unfunded: 4 card
// lnurlp funding: 1 card
// funded by invoice: 5 card
// withdrawn: 3 card
const createSet004 = async (sql: Sql, userId: string): Promise<SetDto> => {
  const set = await createSet(sql, userId, 'Set 004', 13)
  await createWithdrawnCards(sql, set, [1, 4, 12])
  await createCardsFundedByInvoice(sql, set, [2, 3, 5, 6, 11])
  await createCardWithLnurlp(sql, set, 7)
  return set
}

// locked by bulkwithdraw: 30
// withdrawn: 19 card
const createSet005 = async (sql: Sql, userId: string): Promise<SetDto> => {
  const set = await createSet(sql, userId, 'Set 005', 49)
  const indexes = [...Array(50).keys()]
  await createWithdrawnCards(sql, set, indexes.slice(1, 20))
  await createCardsLockedByBulkWithdraw(sql, set, indexes.slice(20, 50))
  return set
}

// unfunded: 5 card
// unfunded with invoice: 2 cards
// funded by invoice: 2 cards
// bulk funded: 80 card
// withdrawn: 10 card
const createSet006 = async (sql: Sql, userId: string): Promise<SetDto> => {
  const set = await createSet(sql, userId, 'Set 006', 99)
  const indexes = [...Array(100).keys()]
  await createWithdrawnCards(sql, set, indexes.slice(1, 11))
  await createCardsFundedByBulkFunding(sql, set, indexes.slice(11, 91))
  await createCardsFundedByInvoice(sql, set, indexes.slice(91, 93))
  await createUnfundedCardsWithInvoice(sql, set, indexes.slice(94, 95))
  return set
}

// unfunded with invoice: 1 card
// unfunded with expired invoice: 1 card
// shared funding with no sats: 1 card
// shared funding partially funded: 1 card
const createSet007 = async (sql: Sql, userId: string): Promise<SetDto> => {
  const set = await createSet(sql, userId, 'Set 007', 99)
  await createUnfundedCardsWithInvoice(sql, set, [0])
  await createCardsWithExpiredInvoice(sql, set, [1])
  await createCardWithSharedFunding(sql, set, 2)
  await createCardWithSharedFundingPartiallyFunded(sql, set, 3)
  return set
}

export const createSetsWithSetFunding = async (
  userId: string,
  numberOfSets: number,
  numberOfCardsPerSet: number,
): Promise<SetDto[]> => {
  const sql = getSqlClient()
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

  await Promise.all(setValues.map(set => createCardsWithSetFunding(sql, set, numberOfCardsPerSet)))

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
