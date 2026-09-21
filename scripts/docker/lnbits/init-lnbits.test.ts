import { describe, expect, it } from 'vitest'
import {
  parseWalletContracts,
  type WalletContract,
} from './bootstrap/config.js'
import { type Wallet } from './bootstrap/LnbitsApi.js'
import { calculateTopUpSats, resolveWallets } from './bootstrap/provision.js'

const backendEnvironment = {
  LNBITS_ADMIN_KEY: '11111111111111111111111111111111',
  LNBITS_INVOICE_READ_KEY: '22222222222222222222222222222222',
  LNBITS_ADMIN_KEY_TEST_USER_WALLET: '44444444444444444444444444444444',
}
const playwrightEnvironment = {
  LNBITS_ADMIN_KEY_TEST_USER_WALLET: '44444444444444444444444444444444',
}
const cypressEnvironment = {
  LNBITS_ADMIN_KEY_TEST_USER_WALLET: '44444444444444444444444444444444',
}

describe('LNbits bootstrap configuration', () => {
  it('builds the two wallet contracts from their owning environment files', () => {
    expect(parseWalletContracts(backendEnvironment, playwrightEnvironment, cypressEnvironment)).toEqual([
      {
        name: 'Application',
        adminKey: backendEnvironment.LNBITS_ADMIN_KEY,
        invoiceKey: backendEnvironment.LNBITS_INVOICE_READ_KEY,
        minimumBalanceSats: 1_000_000,
      },
      {
        name: 'Test User Wallet',
        adminKey: backendEnvironment.LNBITS_ADMIN_KEY_TEST_USER_WALLET,
        minimumBalanceSats: 3_000_000,
      },
    ])
  })

  it('rejects different test-user wallet keys', () => {
    expect(() => parseWalletContracts(
      backendEnvironment,
      playwrightEnvironment,
      { LNBITS_ADMIN_KEY_TEST_USER_WALLET: '55555555555555555555555555555555' },
    )).toThrow('Backend, Playwright, and Cypress must use the same test-user wallet key.')
  })

  it('rejects missing and duplicated credential values', () => {
    expect(() => parseWalletContracts(
      { ...backendEnvironment, LNBITS_ADMIN_KEY: '' },
      playwrightEnvironment,
      cypressEnvironment,
    )).toThrow('Missing required LNBITS_ADMIN_KEY value.')
    expect(() => parseWalletContracts(
      { ...backendEnvironment, LNBITS_INVOICE_READ_KEY: backendEnvironment.LNBITS_ADMIN_KEY },
      playwrightEnvironment,
      cypressEnvironment,
    )).toThrow('Every committed LNbits wallet key must be unique.')
  })
})

describe('LNbits wallet resolution', () => {
  const contracts: WalletContract[] = [
    {
      name: 'Application',
      adminKey: backendEnvironment.LNBITS_ADMIN_KEY,
      invoiceKey: backendEnvironment.LNBITS_INVOICE_READ_KEY,
      minimumBalanceSats: 1_000_000,
    },
  ]

  it('reuses a legacy-named wallet by its committed API-visible key', () => {
    const wallet = createWallet({ name: 'develop', adminkey: backendEnvironment.LNBITS_ADMIN_KEY })

    expect(resolveWallets([wallet], contracts).get('Application')).toBe(wallet)
  })

  it('reuses a bootstrapped wallet by its canonical name', () => {
    const wallet = createWallet({ name: 'Application' })

    expect(resolveWallets([wallet], contracts).get('Application')).toBe(wallet)
  })

  it('rejects ambiguous canonical wallet names', () => {
    expect(() => resolveWallets([
      createWallet({ id: 'wallet-1', name: 'Application' }),
      createWallet({ id: 'wallet-2', name: 'Application' }),
    ], contracts)).toThrow('More than one LNbits wallet matches the Application contract.')
  })

  it('reuses the bootstrap user default wallet when the application wallet is absent', () => {
    const wallet = createWallet({ name: 'LNbits wallet', user: 'bootstrap-user' })

    expect(resolveWallets([wallet], contracts, 'bootstrap-user').get('Application')).toBe(wallet)
  })

  it('prefers an existing application wallet over the bootstrap user default wallet', () => {
    const applicationWallet = createWallet({ id: 'application', name: 'Application' })
    const defaultWallet = createWallet({ id: 'default', name: 'LNbits wallet' })

    expect(resolveWallets([applicationWallet, defaultWallet], contracts, 'user-id').get('Application')).toBe(applicationWallet)
  })

  it('ignores default wallets belonging to another user', () => {
    const wallet = createWallet({ name: 'LNbits wallet', user: 'another-user' })

    expect(resolveWallets([wallet], contracts, 'bootstrap-user').has('Application')).toBe(false)
  })

  it('rejects multiple default wallets belonging to the bootstrap user', () => {
    expect(() => resolveWallets([
      createWallet({ id: 'default-1', name: 'LNbits wallet' }),
      createWallet({ id: 'default-2', name: 'LNbits wallet' }),
    ], contracts, 'user-id')).toThrow('More than one default LNbits wallet belongs to the bootstrap user.')
  })
})

describe('LNbits wallet funding', () => {
  it('only adds the amount required to reach the minimum balance', () => {
    expect(calculateTopUpSats(250_000, 1_000)).toBe(750)
    expect(calculateTopUpSats(1_000_000, 1_000)).toBe(0)
    expect(calculateTopUpSats(1_500_000, 1_000)).toBe(0)
  })

  it('rounds a partial msat deficit up to one sat', () => {
    expect(calculateTopUpSats(999_999, 1_000)).toBe(1)
  })
})

function createWallet(overrides: Partial<Wallet>): Wallet {
  return {
    id: 'wallet-id',
    user: 'user-id',
    name: 'Wallet',
    adminkey: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    inkey: 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
    currency: null,
    balance_msat: 0,
    ...overrides,
  }
}
