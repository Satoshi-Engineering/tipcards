import type { ExtensionContract, WalletContract } from './config.js'
import { LnbitsApi, type Wallet } from './LnbitsApi.js'

const SATS_TO_MSATS = 1_000

export async function ensureExtensions(
  api: LnbitsApi,
  accessToken: string,
  contracts: ExtensionContract[],
): Promise<void> {
  let installedExtensions = await api.getExtensions(accessToken)

  for (const contract of contracts) {
    let extension = installedExtensions.find(candidate => candidate.id === contract.id)
    if (!extension?.isInstalled || extension.installedRelease?.version !== contract.version) {
      const action = extension?.isInstalled ? 'Updating' : 'Installing'
      console.error(`${action} LNbits extension ${contract.id} to ${contract.version}.`)
      await api.installExtension(accessToken, contract)
      installedExtensions = await api.getExtensions(accessToken)
      extension = installedExtensions.find(candidate => candidate.id === contract.id)
    }

    if (!extension?.isInstalled || extension.installedRelease?.version !== contract.version) {
      throw new Error(`LNbits extension ${contract.id} ${contract.version} was not installed.`)
    }
    if (!extension.isActive) {
      console.error(`Activating LNbits extension ${contract.id}.`)
      await api.activateExtension(accessToken, contract.id)
    }
  }
}

export async function ensureWallets(
  api: LnbitsApi,
  accessToken: string,
  authenticatedUserId: string,
  contracts: WalletContract[],
): Promise<Map<string, Wallet>> {
  const resolvedWallets = resolveWallets(await api.getWallets(accessToken), contracts)

  for (const contract of contracts) {
    let wallet = resolvedWallets.get(contract.name)
    if (!wallet) {
      console.error(`Creating LNbits wallet ${contract.name}.`)
      wallet = await api.createWallet(accessToken, contract.name)
      wallet.user = wallet.user || authenticatedUserId
      resolvedWallets.set(contract.name, wallet)
    } else if (wallet.name !== contract.name) {
      console.error(`Renaming LNbits wallet to ${contract.name}.`)
      await api.renameWallet(wallet.adminkey, contract.name)
      wallet.name = contract.name
    }
  }

  return resolvedWallets
}

export async function ensureWalletBalances(
  api: LnbitsApi,
  accessToken: string,
  contracts: WalletContract[],
  wallets: Map<string, Wallet>,
): Promise<void> {
  const refreshedWallets = await api.getWallets(accessToken)

  for (const contract of contracts) {
    const wallet = requireWallet(wallets, contract.name)
    const refreshedWallet = refreshedWallets.find(candidate => candidate.id === wallet.id)
    if (!refreshedWallet) {
      throw new Error(`LNbits did not return the ${contract.name} wallet after reconciliation.`)
    }
    const topUpSats = calculateTopUpSats(refreshedWallet.balance_msat, contract.minimumBalanceSats)
    if (topUpSats > 0) {
      console.error(`Funding LNbits wallet ${contract.name} to its required minimum balance.`)
      await api.updateBalance(accessToken, wallet.id, topUpSats)
    }
  }
}

export async function enableWalletExtensions(
  api: LnbitsApi,
  accessToken: string,
  authenticatedUserId: string,
  extensions: ExtensionContract[],
  wallets: Map<string, Wallet>,
): Promise<void> {
  const ownerIds = new Set([...wallets.values()].map(wallet => wallet.user))

  for (const ownerId of ownerIds) {
    const ownerToken = ownerId === authenticatedUserId
      ? accessToken
      : await api.authenticateUserId(ownerId)
    for (const extension of extensions) {
      await api.enableExtension(ownerToken, extension.id)
    }
  }
}

export async function verifyWallets(
  api: LnbitsApi,
  accessToken: string,
  contracts: WalletContract[],
  wallets: Map<string, Wallet>,
): Promise<void> {
  const apiWallets = await api.getWallets(accessToken)

  for (const contract of contracts) {
    const wallet = requireWallet(wallets, contract.name)
    const apiWallet = apiWallets.find(candidate => candidate.id === wallet.id)
    assertWalletContract(apiWallet, contract)

    const authenticatedWallet = await api.getWallet(contract.adminKey)
    if (authenticatedWallet.id !== wallet.id) {
      throw new Error(`LNbits wallet ${contract.name} rejected its committed admin key.`)
    }
    if (contract.invoiceKey) {
      const invoiceWallet = await api.getInvoiceWallet(contract.invoiceKey)
      if (invoiceWallet.name !== contract.name) {
        throw new Error(`LNbits wallet ${contract.name} rejected its committed invoice key.`)
      }
    }
    console.error(`Verified LNbits wallet ${contract.name}.`)
  }
}

export function resolveWallets(wallets: Wallet[], contracts: WalletContract[]): Map<string, Wallet> {
  const resolvedWallets = new Map<string, Wallet>()
  const claimedWalletIds = new Set<string>()

  for (const contract of contracts) {
    const keyMatches = wallets.filter(wallet =>
      wallet.adminkey === contract.adminKey || wallet.inkey === contract.invoiceKey,
    )
    const nameMatches = wallets.filter(wallet => wallet.name === contract.name)
    const matches = keyMatches.length > 0 ? keyMatches : nameMatches

    if (matches.length > 1) {
      throw new Error(`More than one LNbits wallet matches the ${contract.name} contract.`)
    }
    const wallet = matches[0]
    if (!wallet) {
      continue
    }
    if (claimedWalletIds.has(wallet.id)) {
      throw new Error(`LNbits wallet ${wallet.id} matches more than one wallet role.`)
    }
    claimedWalletIds.add(wallet.id)
    resolvedWallets.set(contract.name, wallet)
  }

  return resolvedWallets
}

export function calculateTopUpSats(balanceMsats: number, minimumBalanceSats: number): number {
  return Math.max(0, Math.ceil((minimumBalanceSats * SATS_TO_MSATS - balanceMsats) / SATS_TO_MSATS))
}

function assertWalletContract(wallet: Wallet | undefined, contract: WalletContract): void {
  if (!wallet
    || wallet.name !== contract.name
    || wallet.adminkey !== contract.adminKey
    || (contract.invoiceKey && wallet.inkey !== contract.invoiceKey)
    || wallet.currency) {
    throw new Error(`LNbits wallet ${contract.name} does not match its committed contract.`)
  }
  if (wallet.balance_msat < contract.minimumBalanceSats * SATS_TO_MSATS) {
    throw new Error(`LNbits wallet ${contract.name} is below its required minimum balance.`)
  }
}

function requireWallet(wallets: Map<string, Wallet>, name: string): Wallet {
  const wallet = wallets.get(name)
  if (!wallet) {
    throw new Error(`Missing resolved LNbits wallet ${name}.`)
  }
  return wallet
}
