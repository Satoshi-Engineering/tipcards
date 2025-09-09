import sqlClient from '@e2e-playwright/utils/database/sqlClient'
import postgres from 'postgres'

export const getCardVersion = async (cardHash: string): Promise<postgres.Row> => {
  const client = sqlClient()
  const rows = await client`
    SELECT id, card, created, "lnurlP", "lnurlW", "textForWithdraw", "noteForStatusPage", "sharedFunding", "landingPageViewed"
	  FROM public."CardVersion"
	  WHERE card = ${cardHash};
  `
  return rows[0]
}
