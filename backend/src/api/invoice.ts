import express from 'express'

import axios from 'axios'

import type { Card } from '../data/Card'
import { getCardByHash, createCard, updateCard } from '../services/database'
import { TIPCARDS_ORIGIN, TIPCARDS_API_ORIGIN, LNBITS_INVOICE_READ_KEY, LNBITS_ADMIN_KEY } from '../constants'
import { getLandingPageLinkForCardHash } from '../../../src/modules/lnurlHelpers'
import { LNBITS_ORIGIN } from '../../../src/constants'

const router = express.Router()

router.post('/create/:cardHash', async (req: express.Request, res: express.Response) => {
  // amount in sats
  let amount: number | undefined = undefined
  let headline = ''
  let text = ''
  try {
    ({ amount, headline, text } = req.body)
  } catch (error) {
    console.error(error)
  }
  if (amount == null || amount < 100) {
    res.status(400).json({
      status: 'error',
      message: 'Invalid input.',
    })
    return
  }

  // check if card/invoice already exists
  let card: Card | null = null
  try {
    card = await getCardByHash(req.params.cardHash)
  } catch (error) {
    console.error(error)
    res.status(500).json({
      status: 'error',
      message: 'Unknown database error.',
    })
    return
  }
  if (card != null) {
    if (card.invoice.paid) {
      res.status(400).json({
        status: 'error',
        message: 'Card is already funded.',
      })
    } else if (card.invoice.amount === amount) {
      res.json({
        status: 'success',
        data: card.invoice.payment_request,
      })
    } else {
      res.status(400).json({
        status: 'error',
        message: `Card already exists with different amount: ${card.invoice.amount}.`,
      })
    }
    return
  }

  // create invoice in lnbits
  let payment_hash: string | undefined = undefined
  let payment_request: string | undefined = undefined
  try {
    const response = await axios.post(`${LNBITS_ORIGIN}/api/v1/payments`, {
      out: false,
      amount,
      memo: 'Fund your Lightning Tip Card',
      webhook: `${TIPCARDS_API_ORIGIN}/api/invoice/paid/${req.params.cardHash}`,
    }, {
      headers: {
        'Content-type': 'application/json',
        'X-Api-Key': LNBITS_INVOICE_READ_KEY,
      },
    })
    ;({ payment_hash, payment_request } = response.data)
    res.json({
      status: 'success',
      data: response.data.payment_request,
    })
  } catch (error) {
    console.error(error)
  }
  if (payment_hash == null || payment_request == null) {
    res.status(500).json({
      status: 'error',
      message: 'Unable to create invoice in lnbits.',
    })
    return
  }

  // persist data
  try {
    await createCard({
      cardHash: req.params.cardHash,
      headline,
      text,
      invoice:  {
        amount,
        payment_hash,
        payment_request,
        paid: false,
      },
      lnbitsWithdrawId: null,
      used: false,
    })
  } catch (error) {
    console.error(error)
  }
})

router.get('/paid/:cardHash', async (req: express.Request, res: express.Response) => {
  // 1. check if card exists
  let card: Card | null = null
  try {
    card = await getCardByHash(req.params.cardHash)
  } catch (error) {
    console.error(error)
    res.status(500).json({
      status: 'error',
      message: 'Unknown database error.',
    })
    return
  }
  if (card == null) {
    res.status(404).json({
      status: 'error',
      message: `Card not found. Go to ${getLandingPageLinkForCardHash(TIPCARDS_ORIGIN, req.params.cardHash)} to fund it.`,
    })
    return
  }
  if (card.invoice == null) {
    res.status(404).json({
      status: 'error',
      message: `Card has no funding invoice. Go to ${getLandingPageLinkForCardHash(TIPCARDS_ORIGIN, req.params.cardHash)} to fund it.`,
    })
    return
  }

  // 2. check if card already has withdrawId
  if (card.lnbitsWithdrawId != null) {
    res.json({
      status: 'success',
      data: 'paid',
    })
    return
  }

  // 3. check if invoice of card is paid
  let paid = false
  if (!card.invoice.paid) {
    try {
      const response = await axios.get(`${LNBITS_ORIGIN}/api/v1/payments/${card.invoice.payment_hash}`, {
        headers: {
          'Content-type': 'application/json',
          'X-Api-Key': LNBITS_INVOICE_READ_KEY,
        },
      })
      if (response.data.paid === true) {
        paid = true
      }
    } catch (error) {
      console.error(error)
      res.status(500).json({
        status: 'error',
        message: 'Unable to check invoice status at lnbits.',
      })
      return
    }
  }
  if (paid) {
    card.invoice.paid = true
    try {
      await updateCard(card)
    } catch (error) {
      console.error(error)
      res.status(500).json({
        status: 'error',
        message: 'Unknown database error.',
      })
      return
    }
  }
  if (!card.invoice.paid) {
    res.json({
      status: 'success',
      data: 'not_paid',
    })
    return
  }

  // 4. create withdrawId and update database
  let withdrawId: string | null = null
  try {
    const response = await axios.post(`${LNBITS_ORIGIN}/withdraw/api/v1/links`, {
      title: `card-${card.cardHash}`,
      min_withdrawable: card.invoice.amount,
      max_withdrawable: card.invoice.amount,
      uses: 1,
      wait_time: 1,
      is_unique: true,
    }, {
      headers: {
        'Content-type': 'application/json',
        'X-Api-Key': LNBITS_ADMIN_KEY,
      },
    })
    if (typeof response.data.id === 'string') {
      withdrawId = response.data.id
    }
  } catch (error) {
    console.error(error)
    res.status(500).json({
      status: 'error',
      message: 'Unable to create withdraw link at lnbits.',
    })
  }
  if (withdrawId == null) {
    res.status(500).json({
      status: 'error',
      message: 'Unable to create withdraw link at lnbits.',
    })
    return
  }
  card.lnbitsWithdrawId = withdrawId
  try {
    await updateCard(card)
  } catch (error) {
    console.error(error)
    res.status(500).json({
      status: 'error',
      message: 'Unknown database error.',
    })
    return
  }
  res.json({
    status: 'success',
    data: 'paid',
  })
})

export default router
