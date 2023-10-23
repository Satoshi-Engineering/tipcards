<template>
  <div class="flex flex-col flex-1 mx-auto w-full max-w-4xl">
    <div class="p-4">
      <HeadlineDefault level="h1">
        Statistics
      </HeadlineDefault>
    </div>

    <div v-if="!isLoggedIn" class="p-4">
      You need to <LinkDefault @click="showModalLogin = true">login</LinkDefault> to access the statistics.
    </div>
    <div v-else-if="!hasPermissions" class="p-4">
      You are missing permissions to access the statistics. Talk to an admin to get them.
    </div>
    <div v-else-if="fetching" class="p-4">
      Fetching data from backend ...
    </div>
    <div v-else-if="statistics != null" class="p-4">
      <HeadlineDefault level="h2">
        Weekly
      </HeadlineDefault>
      <table class="w-full -mx-2">
        <tr class="sticky top-0 bg-white z-20">
          <th class="px-2 sticky left-0 bg-white z-10 text-left">
            Week
          </th>
          <th class="px-2 text-left">
            Transactions
          </th>
          <th class="px-2 text-right">
            Fundings
          </th>
          <th class="px-2 text-right">
            sats
          </th>
          <th class="px-2 text-right">
            Withdrawals
          </th>
          <th class="px-2 text-right">
            sats
          </th>
        </tr>
        <tr v-for="stats in statistics.weekly" :key="stats.periodLabel">
          <th class="px-2 whitespace-nowrap w-28 sticky left-0 bg-white font-semibold z-10 text-left">
            {{ stats.periodLabel }}
          </th>
          <td class="px-2 text-right w-48">
            <div
              :style="`background: linear-gradient(
                to right,
                #fb923c ${stats.transactionsPercent}%,
                transparent ${stats.transactionsPercent}%
              )`"
            >
              {{ stats.transactionsCount }}
            </div>
          </td>
          <td class="px-2 text-right">
            {{ stats.fundingCount }}
          </td>
          <td class="px-2 text-right">
            {{ stats.fundingAmount }}
          </td>
          <td class="px-2 text-right">
            {{ stats.withdrawCount }}
          </td>
          <td class="px-2 text-right">
            {{ stats.withdrawAmount }}
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
          <th class="px-2 text-left">
            Transactions
          </th>
          <th class="px-2 text-right">
            Fundings
          </th>
          <th class="px-2 text-right">
            sats
          </th>
          <th class="px-2 text-right">
            Withdrawals
          </th>
          <th class="px-2 text-right">
            sats
          </th>
        </tr>
        <tr v-for="stats in statistics.daily" :key="stats.periodLabel">
          <th class="px-2 whitespace-nowrap w-28 sticky left-0 bg-white font-semibold z-10 text-left">
            {{ stats.periodLabel }}
          </th>
          <td
            class="px-2 text-right w-48"
          >
            <div
              :style="`background: linear-gradient(
                to right,
                #fb923c ${stats.transactionsPercent}%,
                transparent ${stats.transactionsPercent}%
              )`"
            >
              {{ stats.transactionsCount }}
            </div>
          </td>
          <td class="px-2 text-right">
            {{ stats.fundingCount }}
          </td>
          <td class="px-2 text-right">
            {{ stats.fundingAmount }}
          </td>
          <td class="px-2 text-right">
            {{ stats.withdrawCount }}
          </td>
          <td class="px-2 text-right">
            {{ stats.withdrawAmount }}
          </td>
        </tr>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { ref, computed, watchEffect } from 'vue'
import useTRpc from '@/modules/useTRpc'

import { canAccessStatistics } from '@shared/modules/checkAccessTokenPermissions'
import type { StatisticsPeriod } from '@backend/trpc/data/StatisticsPeriod'

import LinkDefault from '@/components/typography/LinkDefault.vue'
import HeadlineDefault from '@/components/typography/HeadlineDefault.vue'
import { useAuthStore } from '@/stores/auth'
import { useModalLoginStore } from '@/stores/modalLogin'

const { isLoggedIn, accessTokenPayload } = storeToRefs(useAuthStore())
const { showModalLogin } = storeToRefs(useModalLoginStore())

const { client } = useTRpc()

const hasPermissions = computed(() => {
  if (accessTokenPayload.value == null) {
    return false
  }
  return canAccessStatistics(accessTokenPayload.value)
})

const fetching = ref(false)

const statisticsRaw = ref<{ daily: StatisticsPeriod[], weekly: StatisticsPeriod[] }>()

const addPercentagesToPeriods = (periods: StatisticsPeriod[]) => {
  const maxTransactionsPerPeriod = Math.max(...periods.map((period) => period.fundingCount + period.withdrawCount))
  const maxAmountPerPeriod = Math.max(...periods.map((period) => Math.max(period.fundingAmount, period.withdrawAmount)))
  
  return statisticsRaw.value?.daily.map((period) => ({
    ...period,
    transactionsCount: period.fundingCount + period.withdrawCount,
    transactionsPercent: Math.round(
      (period.fundingCount + period.withdrawCount) / maxTransactionsPerPeriod * 10000,
    ) / 100,
    withdrawAmountPercent: Math.round(
      period.withdrawAmount / maxAmountPerPeriod * 10000,
    ) / 100,
    fundingAmountPercent: Math.round(
      period.fundingAmount / maxAmountPerPeriod * 10000,
    ) / 100,
  }))
}

const statistics = computed(() => {
  if (statisticsRaw.value == null) {
    return
  }
  const daily = addPercentagesToPeriods(statisticsRaw.value.daily)
  const weekly = addPercentagesToPeriods(statisticsRaw.value.weekly)
  return {
    daily,
    weekly,
  }
})

const loadStats = async () => {
  fetching.value = true
  try {
    statisticsRaw.value = await client.statistics.getFull.query()
  } catch (error) {
    console.error(error)
    return
  } finally {
    fetching.value = false
  } 
}

watchEffect(() => {
  if (!hasPermissions.value) {
    statisticsRaw.value = undefined
    return
  }
  loadStats()
})
</script>
