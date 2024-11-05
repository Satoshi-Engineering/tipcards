<template>
  <TheLayout>
    <CenterContainer class="!max-w-4xl">
      <div class="py-4">
        <HeadlineDefault level="h1">
          Statistics
        </HeadlineDefault>
      </div>

      <div v-if="!isLoggedIn" class="py-4">
        You need to <LinkDefault @click="showModalLogin = true">login</LinkDefault> to access the statistics.
      </div>
      <div v-else-if="!hasPermissions" class="py-4">
        You are missing permissions to access the statistics. Talk to an admin to get them.
      </div>
      <div v-else-if="fetching" class="py-4">
        Fetching data from backend ...
      </div>
      <div v-else-if="statistics != null" class="py-4">
        <HeadlineDefault level="h2">
          Weekly
        </HeadlineDefault>
        <StatisticsTable
          period-label-col-header="Week"
          :statistics="statistics.weekly"
          :bar-chart-mode="barChartMode"
          @set-bar-chart-mode="barChartMode = $event"
        />

        <HeadlineDefault level="h2">
          Daily
        </HeadlineDefault>
        <StatisticsTable
          period-label-col-header="Day"
          :statistics="statistics.daily"
          :bar-chart-mode="barChartMode"
          @set-bar-chart-mode="barChartMode = $event"
        />
      </div>
    </CenterContainer>
  </TheLayout>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { ref, computed, watchEffect } from 'vue'

import type { StatisticsDto } from '@shared/data/trpc/StatisticsDto'
import { canAccessStatistics } from '@shared/modules/checkAccessTokenPermissions'

import LinkDefault from '@/components/typography/LinkDefault.vue'
import HeadlineDefault from '@/components/typography/HeadlineDefault.vue'
import useTRpc from '@/modules/useTRpc'
import { useAuthStore } from '@/stores/auth'
import { useModalLoginStore } from '@/stores/modalLogin'

import StatisticsTable from './components/StatisticsTable.vue'
import TheLayout from '@/components/layout/TheLayout.vue'
import CenterContainer from '@/components/layout/CenterContainer.vue'

const authStore = useAuthStore()
const { isLoggedIn, accessTokenPayload } = storeToRefs(authStore)
const { showModalLogin } = storeToRefs(useModalLoginStore())

const trpc = useTRpc()

const hasPermissions = computed(() => {
  if (accessTokenPayload.value == null) {
    return false
  }
  return canAccessStatistics(accessTokenPayload.value)
})

const fetching = ref(false)

const statistics = ref<StatisticsDto>()

const barChartMode = ref<'transactions' | 'balance'>('transactions')

const loadStats = async () => {
  fetching.value = true
  try {
    statistics.value = await trpc.statistics.getFull.query()
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
