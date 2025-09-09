import sqlClient from '@e2e-playwright/utils/lnbits/database/sqlClient'
import postgres from 'postgres'

export const updateWithdrawLink = async (id: string, {
  webhookUrl,
}: {
  webhookUrl: string,
}): Promise<postgres.Row> => {
  const client = sqlClient()
  const rows = await client`
    UPDATE withdraw.withdraw_link
    SET webhook_url=${webhookUrl}
    WHERE id = ${id};
  `
  return rows[0]
}
