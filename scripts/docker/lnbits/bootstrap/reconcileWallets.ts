import postgres from 'postgres'
import type { WalletContract } from './config.js'
import type { Wallet } from './LnbitsApi.js'

export async function reconcileWallets(
  databaseUrl: string,
  wallets: Map<string, Wallet>,
  contracts: WalletContract[],
): Promise<void> {
  const sql = postgres(databaseUrl, { max: 1 })
  try {
    await assertWalletSchema(sql)
    await sql.begin(async transaction => {
      for (const [name, wallet] of wallets) {
        const contract = requireContract(contracts, name)
        await assertKeysAreAvailable(transaction, wallet.id, contract)

        const updatedWallets = await transaction<{ id: string }[]>`
          UPDATE public.wallets
          SET adminkey = ${contract.adminKey},
              inkey = COALESCE(${contract.invoiceKey ?? null}, inkey),
              currency = NULL
          WHERE id = ${wallet.id}
          RETURNING id
        `
        if (updatedWallets.length !== 1) {
          throw new Error(`Could not reconcile the ${name} wallet.`)
        }
      }
    })
  } finally {
    await sql.end()
  }
}

async function assertWalletSchema(sql: ReturnType<typeof postgres>): Promise<void> {
  const columns = await sql<{ column_name: string }[]>`
    SELECT column_name
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'wallets'
      AND column_name IN ('id', 'adminkey', 'inkey', 'currency')
  `
  if (columns.length !== 4) {
    throw new Error('LNbits wallet schema does not match the pinned v1.5.3 reconciliation contract.')
  }
}

async function assertKeysAreAvailable(
  sql: postgres.TransactionSql,
  walletId: string,
  contract: WalletContract,
): Promise<void> {
  const conflictingWallets = await sql<{ id: string }[]>`
    SELECT id
    FROM public.wallets
    WHERE id <> ${walletId}
      AND (
        adminkey = ${contract.adminKey}
        OR (${contract.invoiceKey ?? null}::text IS NOT NULL AND inkey = ${contract.invoiceKey ?? null})
      )
  `
  if (conflictingWallets.length > 0) {
    throw new Error(`Committed keys for ${contract.name} are already assigned to another wallet.`)
  }
}

function requireContract(contracts: WalletContract[], name: string): WalletContract {
  const contract = contracts.find(candidate => candidate.name === name)
  if (!contract) {
    throw new Error(`Missing wallet contract for ${name}.`)
  }
  return contract
}
