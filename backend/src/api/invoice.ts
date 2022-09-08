import express from 'express'

import axios from 'axios'

import type { Card } from '../data/Card'
import { getCardByHash, createCard } from '../services/database'

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
    res.status(500).json({
      status: 'error',
      message: 'Unknown database error.',
    })
    console.error(error)
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
    const response = await axios.post('https://legend.lnbits.com/api/v1/payments', {
      out: false,
      amount,
      memo: 'Fund your Lightning Tip Card',
      webhook: `${process.env.TIPCARDS_API_ORIGIN}/api/invoice/paid/${req.params.cardHash}`,
    }, {
      headers: {
        'Content-type': 'application/json',
        'X-Api-Key': process.env.LNBITS_INVOICE_READ_KEY || '',
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

export default router
