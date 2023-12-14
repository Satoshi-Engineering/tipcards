<template>
  <DefaultLayout>
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
        <StatisticsTable
          :statistics="statistics.weekly"
          :bar-chart-mode="barChartMode"
          @set-bar-chart-mode="barChartMode = $event"
        />
        
        <HeadlineDefault level="h2">
          Daily
        </HeadlineDefault>
        <StatisticsTable
          :statistics="statistics.daily"
          :bar-chart-mode="barChartMode"
          @set-bar-chart-mode="barChartMode = $event"
        />
      </div>
    </div>
  </DefaultLayout>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { ref, computed, watchEffect } from 'vue'

import type { StatisticsPeriod } from '@shared/data/trpc/StatisticsPeriod'
import { canAccessStatistics } from '@shared/modules/checkAccessTokenPermissions'

import LinkDefault from '@/components/typography/LinkDefault.vue'
import HeadlineDefault from '@/components/typography/HeadlineDefault.vue'
import useTRpc from '@/modules/useTRpc'
import { useAuthStore } from '@/stores/auth'
import { useModalLoginStore } from '@/stores/modalLogin'

import DefaultLayout from '@/pages/layouts/DefaultLayout.vue'
import StatisticsTable from './components/StatisticsTable.vue'

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

const statistics = ref<{ daily: StatisticsPeriod[], weekly: StatisticsPeriod[] }>()

const barChartMode = ref<'transactions' | 'balance'>('transactions')

const loadStats = async () => {
  fetching.value = true
  try {
    statistics.value = await client.statistics.getFull.query()
  } catch (error) {
    console.error(error)
    return
  } finally {
    fetching.value = false
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
