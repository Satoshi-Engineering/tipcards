import path from 'path'
import { existsSync, readFileSync } from 'fs'
import express from 'express'
import axios from 'axios'
import { DateTime } from 'luxon'

import { canAccessStatistics } from '../../../src/modules/checkAccessTokenPermissions'

import { authGuardPermissions } from '../services/authGuardPermissions'
import { authGuardAccessToken } from '../services/jwt'
import {
  STATISTICS_PREPEND_FILE, STATISTICS_EXCLUDE_FILE,
  LNBITS_INVOICE_READ_KEY, LNBITS_ORIGIN,
} from '../constants'

const router = express.Router()

////////////////
//////// STATISTICS
////

const statisticsInitial = {
  maxMovementsDaily: 0,
  maxMovementsWeekly: 0,
  daily: [] as Record<string, number | string>[],
  weekly: [] as Record<string, number | string>[],
}

const loadJsonIfExists = <T>(filepath: string | undefined, fallbackValue: T): T => {
  if (typeof filepath !== 'string') {
    return fallbackValue
  }
  try {
    const resolvedFilepath = path.resolve(filepath)
    if (!existsSync(resolvedFilepath)) {
      return fallbackValue
    }
    const jsonData = JSON.parse(
      readFileSync(
        resolvedFilepath,
        'utf-8',
      ),
    )
    const typeOfJsonData = Object.prototype.toString.call(jsonData).slice(8,-1)
    const typeOfFallbackValue = Object.prototype.toString.call(fallbackValue).slice(8,-1)
    if (typeOfJsonData !== typeOfFallbackValue) {
      console.error(`JSON file contains unexpected data type. Expected: ${typeOfFallbackValue}, received: ${typeOfJsonData}`)
      return fallbackValue
    }
    return jsonData
  } catch (error) {
    return fallbackValue
  }
}

router.get(
  '/',
  authGuardAccessToken,
  authGuardPermissions(canAccessStatistics),
  async (_, res) => {
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

    const paymentsToPrepend = loadJsonIfExists<Record<string, unknown>[]>(STATISTICS_PREPEND_FILE, [])
    const paymentHashesToExclude = loadJsonIfExists<string[]>(STATISTICS_EXCLUDE_FILE, [])

    const payments = [...paymentsToPrepend, ...response.data].filter(({ payment_hash }) => !paymentHashesToExclude.includes(payment_hash))
    payments.sort((a, b) => b.time - a.time)

    const daily: Record<string, Record<string, number>> = {}
    const weekly: Record<string, Record<string, number>> = {}
    payments.forEach((payment: Record<string, number>) => {
      if (payment.pending || Number.isNaN(payment.time)) {
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
  },
)

export default router
