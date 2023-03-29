<template>
  <div class="flex flex-col flex-1 mx-auto w-full max-w-4xl">
    <div class="p-4">
      <HeadlineDefault level="h1">
        Statistics
      </HeadlineDefault>
    </div>

    <div v-if="statistics == null" class="p-4">
      <form @submit.prevent="onSubmit">
        <label class="block mb-1">
          <span class="block">
            LNbits invoice/read key:
          </span>
          <input
            v-model="apiKeyInputValue"
            type="text"
            class="w-full border my-1 px-3 py-2 focus:outline-none"
            :disabled="fetching"
          >
        </label>
        <ButtonDefault
          type="submit"
          class="text-sm mt-4"
          :loading="fetching"
          :disabled="!apiKeyInputValue || fetching"
        >
          Load
        </ButtonDefault>
      </form>
    </div>
    <div v-else class="p-4">
      <HeadlineDefault level="h2">
        Weekly
      </HeadlineDefault>
      <table class="w-full -mx-2">
        <tr class="sticky top-0 bg-white z-20">
          <th class="px-2 sticky left-0 bg-white z-10 text-left">
            Week
          </th>
          <th class="px-2">
            Movements
          </th>
          <th class="px-2 text-right">
            Fundings
          </th>
          <th class="px-2 text-right">
            Count
          </th>
          <th class="px-2 text-right">
            Withdrawals
          </th>
          <th class="px-2 text-right">
            Count
          </th>
        </tr>
        <tr v-for="stats in statistics.weekly" :key="stats.week">
          <th class="px-2 whitespace-nowrap w-28 sticky left-0 bg-white font-semibold z-10 text-left">
            {{ stats.week }}
          </th>
          <td class="px-2 text-right w-48">
            <div
              :style="`background: linear-gradient(
                to right,
                #fb923c ${stats.movementsPercent}}%,
                transparent ${stats.movementsPercent}%
              )`"
            >
              {{ stats.movementsCount }}
            </div>
          </td>
          <td class="px-2 text-right">
            {{ stats.fundingAmount }}
          </td>
          <td class="px-2 text-right">
            {{ stats.fundingCount }}
          </td>
          <td class="px-2 text-right">
            {{ stats.withdrawAmount }}
          </td>
          <td class="px-2 text-right">
            {{ stats.withdrawCount }}
          </td>
        </tr>
      </table>
      <HeadlineDefault level="h2">
        Daily
      </HeadlineDefault>
      <table class="w-full -mx-2">
        <tr class="sticky top-0 bg-white z-20">
          <th class="px-2 sticky left-0 bg-white z-10 text-left">
            Day
          </th>
          <th class="px-2">
            Movements
          </th>
          <th class="px-2 text-right">
            Fundings
          </th>
          <th class="px-2 text-right">
            Count
          </th>
          <th class="px-2 text-right">
            Withdrawals
          </th>
          <th class="px-2 text-right">
            Count
          </th>
        </tr>
        <tr v-for="stats in statistics.daily" :key="stats.day">
          <th class="px-2 whitespace-nowrap w-28 sticky left-0 bg-white font-semibold z-10 text-left">
            {{ stats.day }}
          </th>
          <td
            class="px-2 text-right w-48"
          >
            <div
              :style="`background: linear-gradient(
                to right,
                #fb923c ${stats.movementsPercent}}%,
                transparent ${stats.movementsPercent}%
              )`"
            >
              {{ stats.movementsCount }}
            </div>
          </td>
          <td class="px-2 text-right">
            {{ stats.fundingAmount }}
          </td>
          <td class="px-2 text-right">
            {{ stats.fundingCount }}
          </td>
          <td class="px-2 text-right">
            {{ stats.withdrawAmount }}
          </td>
          <td class="px-2 text-right">
            {{ stats.withdrawCount }}
          </td>
        </tr>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import axios from 'axios'
import { onMounted, ref } from 'vue'
import { DateTime } from 'luxon'

import HeadlineDefault from '@/components/typography/HeadlineDefault.vue'
import ButtonDefault from '@/components/ButtonDefault.vue'
import { LNBITS_ORIGIN } from '@root/constants'

const SESSION_STORAGE_KEY = 'STATISTICS_KEY'

const apiKeyInputValue = ref<string | undefined>(undefined)
let apiKey: string | null = null

const fetching = ref(false)

const statisticsInitial = {
  maxMovementsDaily: 0,
  maxMovementsWeekly: 0,
  daily: [] as Record<string, number | string>[],
  weekly: [] as Record<string, number | string>[],
}

const statistics = ref<typeof statisticsInitial | undefined>(undefined)

const loadStats = async () => {
  fetching.value = true
  let response
  try {
    response = await axios.get(`${LNBITS_ORIGIN}/api/v1/payments`, {
      headers: {
        'X-Api-Key': apiKey,
        'Content-type': 'application/json',
      },
    })
  } catch (error) {
    fetching.value = false
    console.error(error)
    return
  }
  fetching.value = false
  statistics.value = { ...statisticsInitial }
  const payments = response.data
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
    if (statistics.value != null) {
      statistics.value.maxMovementsDaily = Math.max(statistics.value.maxMovementsDaily, daily[ymd].movementsCount)
      statistics.value.maxMovementsWeekly = Math.max(statistics.value.maxMovementsWeekly, weekly[yw].movementsCount)
    }
  })
  statistics.value.daily = Object.entries(daily).map(([day, values]) => ({
    day,
    ...values,
    movementsPercent: statistics.value ? Math.round(values.movementsCount / statistics.value.maxMovementsDaily * 10000) / 100 : 0,
  }))
  statistics.value.weekly = Object.entries(weekly).map(([week, values]) => ({
    week,
    ...values,
    movementsPercent: statistics.value ? Math.round(values.movementsCount / statistics.value.maxMovementsWeekly * 10000) / 100 : 0,
  }))
}

onMounted(async () => {
  apiKey = sessionStorage.getItem(SESSION_STORAGE_KEY)
  if (apiKey == null || apiKey === '') {
    return
  }
  await loadStats()
})

const onSubmit = async () => {
  if (apiKeyInputValue.value == null) {
    return
  }
  apiKey = apiKeyInputValue.value
  await loadStats()
  if (statistics.value == null) {
    return
  }
  sessionStorage.setItem(SESSION_STORAGE_KEY, apiKey)
}
</script>
