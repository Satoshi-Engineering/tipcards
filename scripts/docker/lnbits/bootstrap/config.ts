import { existsSync, readFileSync } from 'node:fs'
import dotenv from 'dotenv'

const DEFAULT_BOOTSTRAP_USERNAME = 'superuser'
const DEFAULT_BOOTSTRAP_PASSWORD = 'superpassword'
const DEFAULT_COMPOSE_URL = 'http://lnbits:4050'
const DEFAULT_HOST_URL = 'http://127.0.0.1:4050'

type Environment = Record<string, string | undefined>
type EnvironmentFile = Record<string, string>

export interface BootstrapConfig {
  baseUrl: string
  databaseUrl: string
  username: string
  password: string
  extensions: ExtensionContract[]
  wallets: WalletContract[]
}

export interface ExtensionContract {
  id: string
  version: string
  archive: string
  sourceRepo: string
}

export interface WalletContract {
  name: string
  adminKey: string
  invoiceKey?: string
  minimumBalanceSats: number
}

export function loadBootstrapConfig(environment: Environment, baseUrlArgument?: string): BootstrapConfig {
  const backendEnvironment = loadEnvironmentFile('backend/.env')
  const playwrightEnvironment = loadEnvironmentFile('e2e-playwright/.env')
  const cypressEnvironment = loadEnvironmentFile('e2e-cypress/.env')
  const lnbitsEnvironment = loadEnvironmentFile('scripts/docker/lnbits/.env')
  const runsInContainer = existsSync('/.dockerenv')
  const defaultBaseUrl = runsInContainer ? DEFAULT_COMPOSE_URL : DEFAULT_HOST_URL
  const databaseUrl = environment.LNBITS_DATABASE_URL
    ?? hostAccessibleDatabaseUrl(requireValue(lnbitsEnvironment, 'LNBITS_DATABASE_URL'), runsInContainer)

  return {
    baseUrl: normalizeBaseUrl(baseUrlArgument ?? environment.LNBITS_BASE_URL ?? defaultBaseUrl),
    databaseUrl,
    username: environment.LNBITS_BOOTSTRAP_USERNAME ?? DEFAULT_BOOTSTRAP_USERNAME,
    password: environment.LNBITS_BOOTSTRAP_PASSWORD ?? DEFAULT_BOOTSTRAP_PASSWORD,
    extensions: extensionContracts(),
    wallets: parseWalletContracts(backendEnvironment, playwrightEnvironment, cypressEnvironment),
  }
}

export function parseWalletContracts(
  backendEnvironment: EnvironmentFile,
  playwrightEnvironment: EnvironmentFile,
  cypressEnvironment: EnvironmentFile,
): WalletContract[] {
  const backendTestAdminKey = requireValue(backendEnvironment, 'LNBITS_ADMIN_KEY_TEST_USER_WALLET')
  const playwrightTestAdminKey = requireValue(playwrightEnvironment, 'LNBITS_ADMIN_KEY_TEST_USER_WALLET')
  const cypressTestAdminKey = requireValue(cypressEnvironment, 'LNBITS_ADMIN_KEY_TEST_USER_WALLET')

  if (new Set([backendTestAdminKey, playwrightTestAdminKey, cypressTestAdminKey]).size !== 1) {
    throw new Error('Backend, Playwright, and Cypress must use the same test-user wallet key.')
  }

  const wallets: WalletContract[] = [
    {
      name: 'Application',
      adminKey: requireValue(backendEnvironment, 'LNBITS_ADMIN_KEY'),
      invoiceKey: requireValue(backendEnvironment, 'LNBITS_INVOICE_READ_KEY'),
      minimumBalanceSats: 1_000_000,
    },
    {
      name: 'Test User Wallet',
      adminKey: backendTestAdminKey,
      minimumBalanceSats: 3_000_000,
    },
  ]

  validateWalletKeys(wallets)
  return wallets
}

function loadEnvironmentFile(path: string): EnvironmentFile {
  try {
    return dotenv.parse(readFileSync(path))
  } catch (error) {
    throw new Error(`Could not read required environment file ${path}.`, { cause: error })
  }
}

function extensionContracts(): ExtensionContract[] {
  return [
    {
      id: 'withdraw',
      version: '1.3.0',
      archive: 'https://github.com/lnbits/withdraw/archive/refs/tags/v1.3.0.zip',
      sourceRepo: 'https://raw.githubusercontent.com/lnbits/lnbits-extensions/main/extensions.json',
    },
    {
      id: 'lnurlp',
      version: '1.3.2',
      archive: 'https://github.com/lnbits/lnurlp/archive/refs/tags/v1.3.2.zip',
      sourceRepo: 'https://raw.githubusercontent.com/lnbits/lnbits-extensions/main/extensions.json',
    },
  ]
}

function validateWalletKeys(wallets: WalletContract[]): void {
  const keys = wallets.flatMap(wallet => [wallet.adminKey, wallet.invoiceKey].filter(value => value !== undefined))
  if (new Set(keys).size !== keys.length) {
    throw new Error('Every committed LNbits wallet key must be unique.')
  }
  for (const key of keys) {
    if (!/^[a-f0-9]{32}$/.test(key)) {
      throw new Error('Committed LNbits wallet keys must be 32 lowercase hexadecimal characters.')
    }
  }
}

function requireValue(environment: EnvironmentFile, name: string): string {
  const value = environment[name]?.trim()
  if (!value) {
    throw new Error(`Missing required ${name} value.`)
  }
  return value
}

function normalizeBaseUrl(baseUrl: string): string {
  return baseUrl.replace(/\/$/, '')
}

function hostAccessibleDatabaseUrl(databaseUrl: string, runsInContainer: boolean): string {
  if (runsInContainer) {
    return databaseUrl
  }
  const url = new URL(databaseUrl)
  url.hostname = '127.0.0.1'
  return url.toString()
}
