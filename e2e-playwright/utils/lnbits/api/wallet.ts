import type { APIRequestContext } from '@playwright/test'
import { expect } from '@playwright/test'

export const getWalletBalance = async (context: APIRequestContext) => {
  const details = await getWalletDetails(context)
  return details.balance / 1000 // Return balance in sats
}

export const getAndCheckWalletBalance = async (context: APIRequestContext, balance: number, mode: 'minimal' | 'exact' = 'minimal') => {
  const walletBalance = await getWalletBalance(context)
  switch (mode) {
    // Ensure the wallet has exactly the specified balance
    case 'exact':
      expect(walletBalance, `Wallet balance needs to be exactly ${balance} sats`).toBe(balance)
      break

    // Ensure the wallet has enough balance
    case 'minimal':
      expect(walletBalance, `Wallet balance needs to be >= ${balance} sats`).toBeGreaterThanOrEqual(balance)
      break
  }
  return walletBalance // Return balance in sats
}

const getWalletDetails = async (context: APIRequestContext) => {
  const response = await context.get('/api/v1/wallet')
  if (!response.ok()) {
    throw new Error(`Failed to get wallet balance: ${await response.text()}`)
  }
  return await response.json()
}
