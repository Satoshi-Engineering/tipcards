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
import { storeToRefs } from 'pinia'
import { ref, computed, watchEffect } from 'vue'

import { canAccessStatistics } from '@root/modules/checkAccessTokenPermissions'

import LinkDefault from '@/components/typography/LinkDefault.vue'
import HeadlineDefault from '@/components/typography/HeadlineDefault.vue'
import { useUserStore } from '@/stores/user'
import { BACKEND_API_ORIGIN } from '@/constants'

const userStore = useUserStore()
const { isLoggedIn, showModalLogin, accessTokenPayload } = storeToRefs(userStore)

const hasPermissions = computed(() => {
  if (accessTokenPayload.value == null) {
    return false
  }
  return canAccessStatistics(accessTokenPayload.value)
})

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
    response = await axios.get(`${BACKEND_API_ORIGIN}/api/statistics`)
    fetching.value = false
    statistics.value = response.data.data
  } catch (error) {
    fetching.value = false
    console.error(error)
    return
  }
}

watchEffect(() => {
  if (!hasPermissions.value) {
    statistics.value = undefined
    return
  }
  loadStats()
})
</script>
