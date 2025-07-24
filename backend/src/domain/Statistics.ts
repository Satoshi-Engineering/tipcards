import axios from 'axios'
import { DateTime } from 'luxon'
import z from 'zod'

import type { StatisticsDto, StatisticsPeriodDto } from '@shared/data/trpc/StatisticsDto.js'
import { ErrorWithCode, ErrorCode } from '@shared/data/Errors.js'

import loadJsonIfExists from '@backend/services/loadJsonIfExists.js'
import { LNBITS_ORIGIN, LNBITS_INVOICE_READ_KEY, STATISTICS_EXCLUDE_FILE } from '@backend/constants.js'

const Payment = z.object({
  status: z.string(),
  time: z.string()
    .refine(val => DateTime.fromISO(`${val}Z`).isValid, { message: 'Invalid date' })
    .transform(val => Math.floor(DateTime.fromISO(`${val}Z`).toUTC().toSeconds())),
  amount: z.number(),
  payment_hash: z.string(),
})
type Payment = z.infer<typeof Payment>

export default class Statistics {
  public static async getStatistics(limit?: number): Promise<StatisticsDto> {
    const payments = await Statistics.loadPayments(limit)
    const daily = Statistics.accumulatePaymentsByPeriod(payments, 'yyyy-MM-dd')
    const weekly = Statistics.accumulatePaymentsByPeriod(payments, 'kkkk-WW')
    // Remove the last week if we are not showing all the data, because the first week and day might be incomplete
    if (limit != null) {
      daily.pop()
      weekly.pop()
    }
    return {
      daily,
      weekly,
    }
  }

  private static async loadPaymentsFromLnbits(limit?: number, offset: number = 0): Promise<{ total: number, data: Payment[] }> {
    let response
    try {
      let url = `${LNBITS_ORIGIN}/api/v1/payments/paginated?sortby=time&direction=desc`
      if (limit != null) {
        url += `&limit=${limit}&offset=${offset}`
      }
      response = await axios.get(url, {
        headers: {
          'X-Api-Key': LNBITS_INVOICE_READ_KEY,
          'Content-type': 'application/json',
        },
      })
      return z.object({
        data: Payment.array(),
        total: z.number(),
      }).parse(response.data)
    } catch (error) {
      throw new ErrorWithCode(error, ErrorCode.UnableToGetLnbitsPaymentRequests)
    }
  }

  private static async loadPayments(limit?: number, offset: number = 0) {
    const paymentHashesToExclude = loadJsonIfExists<string[]>(STATISTICS_EXCLUDE_FILE, [])

    const { data: paymentsFromLnbits } = await Statistics.loadPaymentsFromLnbits(limit, offset)

    const payments = paymentsFromLnbits.filter(
      ({ payment_hash }) => !paymentHashesToExclude.includes(payment_hash),
    )

    payments.sort((a, b) => b.time - a.time)

    return payments
  }

  private static accumulatePaymentsByPeriod(payments: Payment[], periodLabelDatetimeFormat: string): StatisticsPeriodDto[] {
    const periods: Record<string, {
      fundingAmount: number,
      fundingCount: number,
      withdrawAmount: number,
      withdrawCount: number,
    }> = {}

    payments.forEach((payment) => {
      if (payment.status === 'pending' || Number.isNaN(payment.time)) {
        return
      }
      const dt = DateTime.fromSeconds(payment.time)
      const periodLabel = dt.toFormat(periodLabelDatetimeFormat)
      if (periods[periodLabel] == null) {
        periods[periodLabel] = {
          fundingAmount: 0,
          fundingCount: 0,
          withdrawAmount: 0,
          withdrawCount: 0,
        }
      }
      if (payment.amount > 0) {
        periods[periodLabel].fundingAmount += payment.amount / 1000
        periods[periodLabel].fundingCount += 1
      }
      if (payment.amount < 0) {
        periods[periodLabel].withdrawAmount += -payment.amount / 1000
        periods[periodLabel].withdrawCount += 1
      }
    })

    return Object.entries(periods).map(([periodLabel, values]) => ({
      periodLabel,
      ...values,
    }))
  }
}
