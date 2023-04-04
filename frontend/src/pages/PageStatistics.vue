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
            Statistics Auth Token:
          </span>
          <input
            v-model="apiKeyInputValue"
            type="password"
            autocomplete="current-password"
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
          <th class="px-2 text-left">
            Movements
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
        <tr v-for="stats in statistics.weekly" :key="stats.week">
          <th class="px-2 whitespace-nowrap w-28 sticky left-0 bg-white font-semibold z-10 text-left">
            {{ stats.week }}
          </th>
          <td class="px-2 text-right w-48">
            <div
              :style="`background: linear-gradient(
                to right,
                #fb923c ${stats.movementsPercent}%,
                transparent ${stats.movementsPercent}%
              )`"
            >
              {{ stats.movementsCount }}
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
            Movements
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
                #fb923c ${stats.movementsPercent}%,
                transparent ${stats.movementsPercent}%
              )`"
            >
              {{ stats.movementsCount }}
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
import axios from 'axios'
import { onMounted, ref } from 'vue'

import HeadlineDefault from '@/components/typography/HeadlineDefault.vue'
import ButtonDefault from '@/components/ButtonDefault.vue'
import { BACKEND_API_ORIGIN } from '@/constants'

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
    response = await axios.get(`${BACKEND_API_ORIGIN}/api/statistics`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    })
    fetching.value = false
    statistics.value = response.data.data
  } catch (error) {
    fetching.value = false
    console.error(error)
    return
  }

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
  if (location.hostname === 'localhost') {
    sessionStorage.setItem(SESSION_STORAGE_KEY, apiKey)
  }
}
</script>
