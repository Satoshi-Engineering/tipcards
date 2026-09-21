import { pathToFileURL } from 'node:url'
import { loadBootstrapConfig } from './bootstrap/config.js'
import { LnbitsApi } from './bootstrap/LnbitsApi.js'
import {
  enableWalletExtensions,
  ensureExtensions,
  ensureWalletBalances,
  ensureWallets,
  verifyWallets,
} from './bootstrap/provision.js'
import { reconcileWallets } from './bootstrap/reconcileWallets.js'

async function main(): Promise<void> {
  const config = loadBootstrapConfig(process.env, process.argv[2])
  const api = new LnbitsApi(config.baseUrl)

  console.error(`Waiting for LNbits at ${config.baseUrl}.`)
  await api.waitUntilReady()

  const accessToken = await api.authenticate(config.username, config.password)
  const authenticatedUser = await api.getAuthenticatedUser(accessToken)

  await api.allowPrivateNetworkTargets(accessToken)
  await ensureExtensions(api, accessToken, config.extensions)
  const wallets = await ensureWallets(api, accessToken, authenticatedUser.id, config.wallets)
  await reconcileWallets(config.databaseUrl, wallets, config.wallets)
  await ensureWalletBalances(api, accessToken, config.wallets, wallets)
  await enableWalletExtensions(api, accessToken, authenticatedUser.id, config.extensions, wallets)
  await verifyWallets(api, accessToken, config.wallets, wallets)

  console.error('LNbits bootstrap completed successfully.')
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch(error => {
    console.error(error instanceof Error ? error.message : 'LNbits bootstrap failed.')
    process.exitCode = 1
  })
}
