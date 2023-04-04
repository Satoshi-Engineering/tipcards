import path from 'path'
import { readFileSync } from 'fs'
import express from 'express'
import axios from 'axios'
import { DateTime } from 'luxon'

import { SUPPORT_TOKENS, LNBITS_INVOICE_READ_KEY } from '../constants'
import { LNBITS_ORIGIN } from '../../../src/constants'

const authenticateUser = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  let token = ''
  const bearer = req.header('Authorization')
  if (bearer && bearer.startsWith('Bearer ')) {
    token = bearer.substring(7)
  }
  if (SUPPORT_TOKENS.includes(token)) {
    return next()
  }

  res
    .status(401)
    .json({
      status: 'error',
      message: 'Not authorized.',
    })
    .end()
}

const router = express.Router()

router.use(authenticateUser)

////////////////
//////// STATISTICS
////

const systemFundingHashes = [
  '0f79aa3730e42447a8b6e44cb59bf26f41122847372881e6fb868aaf3a360b92',
  '32882907fc145c818967c1fcdb5a8e23df619079198c60e46df900e8c1108263',
  '555257551d01e93e60ceb5a314cf28dfdb88aa338049798d6987d55179bed3de',
  'b2cbc0e877d5e50a17697879716e4a64567e07c28295d3a68a589aeb023164f1',
  'd8d492f6d9be77514bffd44c25ba930f81028b61e3b225d3878f92b98df61792',
  '3f856cd99aad16c704a5e08bd6df1c369e98e236a204abce8e9a7d974b07cd18',
  '9505d8e0d64cf76a9d4777903e2bf43c4e025601b5295722760a5f6f62c893e1',
  'fbb7b2465fa7175e7e2b9f3208130c1a4fd8f38fb802fddf03c7a6ffb51c2954',
  '43e8f3e846259925d2e3aaab1812d0df0754e3cb77d8cea99f5985818deabc14',
  '555257551d01e93e60ceb5a314cf28dfdb88aa338049798d6987d55179bed3de',
  'aea10db46806ab5bff24a754e7b68ebc23339fb5b4a9b9635545f82a7f6e2b19',
  '9c49894cac7825548d3ce8851a0c8b72a48761280101dad6ea9231ae1aa9882d',
  '9acd30d19df6aebd9ed355e5b9c30f7f6361c6d8ebd8a6b96e4e116054eb5df5',
  '0e216cea27395bbd9a251b149f02becb0686180776a68e83643606d8fd226f19',
  '584eed8b00b6af0599cf7280921507440bc7686be10b167dc37036a6caa30abf',
  'bcd13b6626913bb5a86b3ebfd56c4f9c59ec914dd115962792e9e4bde682efe3',
  
  'Lnbvykafa6gDeWtb6gsAPe',
]

const statisticsInitial = {
  maxMovementsDaily: 0,
  maxMovementsWeekly: 0,
  daily: [] as Record<string, number | string>[],
  weekly: [] as Record<string, number | string>[],
}

router.get('/', async (req: express.Request, res: express.Response) => {
  let response
  try {
    response = await axios.get(`${LNBITS_ORIGIN}/api/v1/payments`, {
      headers: {
        'X-Api-Key': LNBITS_INVOICE_READ_KEY,
        'Content-type': 'application/json',
      },
    })
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: 'Could not get payments from LNbits.',
    })
  }
  const statistics = { ...statisticsInitial }
  let legendsFile = path.resolve(__dirname, '../data/statistics/legendsPaymentsDev.json')
  if (process.env.NODE_ENV === 'production') {
    legendsFile = path.resolve(__dirname, '../data/statistics/legendsPaymentsProd.json')
  }
  const legendsPayments = JSON.parse(
    readFileSync(
      legendsFile,
      'utf-8',
    ),
  )
  const payments = [...legendsPayments, ...response.data].filter(({ payment_hash }) => !systemFundingHashes.includes(payment_hash))
  payments.sort((a, b) => b.time - a.time)
  const daily: Record<string, Record<string, number>> = {}
  const weekly: Record<string, Record<string, number>> = {}
  payments.forEach((payment: Record<string, number>) => {
    if (payment.pending) {
      return
    }
    const dt = DateTime.fromSeconds(payment.time)
    const ymd = dt.toFormat('yyyy-MM-dd')
    const yw = dt.toFormat('kkkk-WW')
    if (daily[ymd] == null) {
      daily[ymd] = {
        fundingAmount: 0,
        fundingCount: 0,
        withdrawAmount: 0,
        withdrawCount: 0,
      }
    }
    if (weekly[yw] == null) {
      weekly[yw] = {
        fundingAmount: 0,
        fundingCount: 0,
        withdrawAmount: 0,
        withdrawCount: 0,
      }
    }
    if (payment.amount > 0) {
      daily[ymd].fundingAmount += payment.amount / 1000
      daily[ymd].fundingCount += 1
      weekly[yw].fundingAmount += payment.amount / 1000
      weekly[yw].fundingCount += 1
    }
    if (payment.amount < 0) {
      daily[ymd].withdrawAmount += -payment.amount / 1000
      daily[ymd].withdrawCount += 1
      weekly[yw].withdrawAmount += -payment.amount / 1000
      weekly[yw].withdrawCount += 1
    }
    daily[ymd].movementsCount = daily[ymd].fundingCount + daily[ymd].withdrawCount
    weekly[yw].movementsCount = weekly[yw].fundingCount + weekly[yw].withdrawCount
    if (statistics != null) {
      statistics.maxMovementsDaily = Math.max(statistics.maxMovementsDaily, daily[ymd].movementsCount)
      statistics.maxMovementsWeekly = Math.max(statistics.maxMovementsWeekly, weekly[yw].movementsCount)
    }
  })
  statistics.daily = Object.entries(daily).map(([day, values]) => ({
    day,
    ...values,
    movementsPercent: statistics ? Math.round(values.movementsCount / statistics.maxMovementsDaily * 10000) / 100 : 0,
  }))
  statistics.weekly = Object.entries(weekly).map(([week, values]) => ({
    week,
    ...values,
    movementsPercent: statistics ? Math.round(values.movementsCount / statistics.maxMovementsWeekly * 10000) / 100 : 0,
  }))

  
  res.json({
    status: 'success',
    data: statistics,
  })
})

export default router
