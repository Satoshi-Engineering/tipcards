import axios, { AxiosResponse } from 'axios'
import '../initEnv'
import hashSha256 from '@backend/services/hashSha256'
import { randomUUID } from 'crypto'
import { LNBitsWallet } from '../lightning/LNBitsWallet'
import { LNURLw } from '@shared/data/LNURLw'

const TEST_AMOUNT_IN_SATS = 100

const cardHash = hashSha256(randomUUID())
const cardBody = {
  amount: TEST_AMOUNT_IN_SATS,
  text: `${cardHash} textForWithdraw`,
  note: `${cardHash} noteForStatusPage`,
}
let fundingInvoice = ''
let lnbitsWithdrawId = ''
let lnurlWithdrawWebhook = ''

const wallet = new LNBitsWallet(process.env.LNBITS_ORIGIN || '', process.env.LNBITS_ADMIN_KEY || '')

const EXPECTED_OBJECT = {
  status: 'success',
  data: {
    cardHash: cardHash,
    text: cardBody.text,
    note: cardBody.note,
    invoice: {
      created: expect.any(Number),
      expired: false,
      amount: cardBody.amount,
      paid: null,
      payment_request: '',
      payment_hash: expect.any(String),
    },
    lnurlp: null,
    setFunding: null,
    lnbitsWithdrawId: null,
    landingPageViewed: null,
    isLockedByBulkWithdraw: false,
    used: null,
    withdrawPending: false,
  },
}

describe('card | fund & withdraw', () => {
  it('should check if lnbits wallet has enough balance for testing', async () => {
    const data = await wallet.getWalletDetails()

    expect(data).not.toBeNull()
    expect(data?.balance).toBeGreaterThanOrEqual(TEST_AMOUNT_IN_SATS * 1000)
  })

  it('should create a card with valid ln invoice', async () => {
    let response: AxiosResponse
    try {
       response = await axios.post(`${process.env.TEST_API_ORIGIN}/api/invoice/create/${cardHash}`, cardBody)
    } catch (error) {
      console.error(error)
      expect(false).toBe(true)
      return
    }

    expect(response.data.status).toBe('success')
    expect(response.data.data).toMatch(/ln[a-z0-9]*/)

    fundingInvoice = response.data.data
  })

  it('should return status of a empty (unfunded) card', async () => {
    let response: AxiosResponse
    try {
      response = await axios.get(`${process.env.TEST_API_ORIGIN}/api/card/${cardHash}`)
    } catch (error) {
      console.error(error)
      expect(false).toBe(true)
      return
    }

    EXPECTED_OBJECT.data.invoice.payment_request = fundingInvoice

    expect(response.data).toEqual(expect.objectContaining(EXPECTED_OBJECT))

    EXPECTED_OBJECT.data.invoice.created = response.data.data.invoice.created
    EXPECTED_OBJECT.data.invoice.payment_hash = response.data.data.invoice.payment_hash
  })

  it('should pay funding invoice of card', async () => {
    const data = await wallet.payInvoice(fundingInvoice)

    expect(data.payment_hash).toHaveLength(64)
    expect(data['checking_id']).toHaveLength(64)
  })

  it('should return status of a funded card', async () => {
    let response: AxiosResponse
    try {
      response = await axios.get(`${process.env.TEST_API_ORIGIN}/api/card/${cardHash}`)
    } catch (error) {
      console.error(error)
      expect(false).toBe(true)
      return
    }

    EXPECTED_OBJECT.data.invoice.paid = expect.any(Number)
    EXPECTED_OBJECT.data.lnbitsWithdrawId = expect.any(String)

    expect(response.data).toEqual(expect.objectContaining(EXPECTED_OBJECT))

    EXPECTED_OBJECT.data.invoice.paid = response.data.data.invoice.paid
    EXPECTED_OBJECT.data.lnbitsWithdrawId = response.data.data.lnbitsWithdrawId

    lnbitsWithdrawId = response.data.data.lnbitsWithdrawId
  })

  it('should withdraw the funds of the lnurlw', async () => {
    let response: AxiosResponse
    try {
      response = await axios.get(`${process.env.TEST_API_ORIGIN}/api/lnurl/${cardHash}`)
    } catch (error) {
      console.error(error)
      expect(false).toBe(true)
      return
    }

    const lnurlw = LNURLw.parse(response.data)

    await wallet.withdrawAllFromLNURLW(lnurlw)
  })

  it('should return status of a withdraw pending card', async () => {
    let response: AxiosResponse
    try {
      response = await axios.get(`${process.env.TEST_API_ORIGIN}/api/card/${cardHash}`)
    } catch (error) {
      console.error(error)
      expect(false).toBe(true)
      return
    }

    EXPECTED_OBJECT.data.withdrawPending = true

    expect(response.data).toEqual(expect.objectContaining(EXPECTED_OBJECT))
  })

  it('should call lnurlw withdraw callback', async () => {
    const data = await wallet.getLNURLWById(lnbitsWithdrawId)
    lnurlWithdrawWebhook = data.webhook_url

    try {
      await axios.get(lnurlWithdrawWebhook)
    } catch (error) {
      console.error(error)
      expect(false).toBe(true)
      return
    }
  })

  it('should return status of a withdrawn card', async () => {
    let response: AxiosResponse
    try {
      response = await axios.get(`${process.env.TEST_API_ORIGIN}/api/card/${cardHash}`)
    } catch (error) {
      console.error(error)
      expect(false).toBe(true)
      return
    }

    EXPECTED_OBJECT.data.used = expect.any(Number)
    EXPECTED_OBJECT.data.withdrawPending = false

    expect(response.data).toEqual(expect.objectContaining(EXPECTED_OBJECT))
  })
})
