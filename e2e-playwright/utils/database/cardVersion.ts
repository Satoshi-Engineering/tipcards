import postgres from 'postgres'

import sqlClient from '@e2e-playwright/utils/database/sqlClient'

export const getCardVersion = async (cardHash: string): Promise<postgres.Row> => {
  const client = sqlClient()
  const rows = await client`
    SELECT id, card, created, "lnurlP", "lnurlW", "textForWithdraw", "noteForStatusPage", "sharedFunding", "landingPageViewed"
	  FROM public."CardVersion"
	  WHERE card = ${cardHash};
  `
  return rows[0]
}

export const setCardWithdrawnDateIntoPast = async (cardHash: string) => {
  const client = sqlClient()
  const [cardVersion] = await client`
    SELECT "lnurlW"
    FROM public."CardVersion"
    WHERE card = ${cardHash};
  `
  await client`
    UPDATE public."LnurlW"
    SET withdrawn = '2024-01-01 12:00:00+00'
    WHERE "lnbitsId" = ${cardVersion.lnurlW};
  `
}
