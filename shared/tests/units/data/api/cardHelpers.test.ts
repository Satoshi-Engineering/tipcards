import { describe, it, expect } from 'vitest'

import { getPaidTimestamp, getPaidAmount } from '@shared/data/api/cardHelpers.js'

const card = {
  cardHash: 'someHash',
  text: '',
  note: '',
  invoice: null,
  lnurlp: null,
  setFunding: null,
  lnbitsWithdrawId: null,
  withdrawPending: false,
  landingPageViewed: null,
  isLockedByBulkWithdraw: false,
  used: null,
}

const cardWithPaidInvoice = {
  ...card,
  invoice: {
    amount: 5607,
    payment_hash: 'someHash',
    payment_request: 'someRequest',
    created: 398639786,
    paid: 398639786124,
    expired: false,
  },
}

const cardWithPaidLnurlP = {
  ...card,
  lnurlp: {
    shared: false,
    amount: 3254357,
    payment_hash: ['someHash'],
    id: 'someId',
    created: 87456,
    paid: 6876587,
    expired: false,
  },
}

const cardWithPaidSetFunding = {
  ...card,
  setFunding: {
    amount: 378962,
    created: 298646,
    paid: 3978645986,
    expired: false,
  },
}

describe('cardHelpers | getPaidTimestamp', () => {
  it('should return null if it\' not paid', () => {
    const paid = getPaidTimestamp(card)
    expect(paid).toBe(null)
  })

  it('should return the timestamp of the invoice if it\' paid', () => {
    const paid = getPaidTimestamp(cardWithPaidInvoice)
    expect(paid).toBe(398639786124)
  })

  it('should return the timestamp of the lnurlp if it\' paid', () => {
    const paid = getPaidTimestamp(cardWithPaidLnurlP)
    expect(paid).toBe(6876587)
  })

  it('should return the timestamp of the set funding if it\' paid', () => {
    const paid = getPaidTimestamp(cardWithPaidSetFunding)
    expect(paid).toBe(3978645986)
  })
})

describe('cardHelpers | getPaidAmount', () => {
  it('should return null if it\' not paid', () => {
    const paid = getPaidAmount(card)
    expect(paid).toBe(0)
  })

  it('should return the timestamp of the invoice if it\' paid', () => {
    const paid = getPaidAmount(cardWithPaidInvoice)
    expect(paid).toBe(5607)
  })

  it('should return the timestamp of the lnurlp if it\' paid', () => {
    const paid = getPaidAmount(cardWithPaidLnurlP)
    expect(paid).toBe(3254357)
  })

  it('should return the timestamp of the set funding if it\' paid', () => {
    const paid = getPaidAmount(cardWithPaidSetFunding)
    expect(paid).toBe(378962)
  })
})
