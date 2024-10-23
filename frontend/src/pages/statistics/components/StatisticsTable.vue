<template>
  <table class="w-full -mx-2">
    <tr class="sticky top-16 bg-white z-20">
      <th class="px-2 sticky left-0 bg-white z-10 text-left">
        {{ periodLabelColHeader }}
      </th>
      <th class="px-2 text-left">
        <LinkDefault
          class="!break-normal"
          variant="none"
          @click="toggleBarChartMode"
        >
          {{ barChartMode === 'balance' ? 'Balance' : 'Transactions' }}
        </LinkDefault>
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
    <tr v-for="period in statisticsWithPercentages" :key="period.periodLabel">
      <th class="px-2 whitespace-nowrap w-28 sticky left-0 bg-white font-semibold z-10 text-left">
        {{ period.periodLabel }}
      </th>
      <td class="px-2 text-right w-48 h-0.5">
        <div
          v-if="barChartMode === 'transactions'"
          class="h-full"
          :style="`background: linear-gradient(
            to right,
            #fb923c ${period.transactionsPercent}%,
            transparent ${period.transactionsPercent}%
          )`"
        >
          {{ period.transactionsCount }}
        </div>
        <div
          v-else
          class="flex justify-between items-center h-full"
          :style="`background: linear-gradient(
            to right,
            transparent 0 ${50 - period.withdrawAmountPercent / 2}%,
            #fb923c ${50 - period.withdrawAmountPercent / 2}% calc(50% - 0.5px),
            transparent calc(50% - 0.5px) calc(50% + 0.5px),
            #fb923c calc(50% + 0.5px) ${period.fundingAmountPercent / 2 + 50}%,
            transparent ${period.fundingAmountPercent / 2 + 50}% 100%
          )`"
        >
          <span class="text-xs">-{{ formatNumber(period.withdrawAmount, 0) }}</span>
          <span class="text-xs">{{ formatNumber(period.fundingAmount, 0) }}</span>
        </div>
      </td>
      <td class="px-2 text-right">
        {{ period.fundingCount }}
      </td>
      <td class="px-2 text-right">
        {{ formatNumber(period.fundingAmount, 0) }}
      </td>
      <td class="px-2 text-right">
        {{ period.withdrawCount }}
      </td>
      <td class="px-2 text-right">
        {{ formatNumber(period.withdrawAmount, 0) }}
      </td>
    </tr>
  </table>
</template>

<script setup lang="ts">
import { computed, type PropType } from 'vue'

import formatNumber from '@/modules/formatNumber'
import LinkDefault from '@/components/typography/LinkDefault.vue'
import type { StatisticsPeriodDto } from '@shared/data/trpc/StatisticsDto'

const props = defineProps({
  barChartMode: {
    type: String as PropType<'transactions' | 'balance'>,
    default: 'transactions',
  },
  statistics: {
    type: Array as PropType<StatisticsPeriodDto[]>,
    default: () => [],
  },
  periodLabelColHeader: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['setBarChartMode'])

const toggleBarChartMode = () => {
  if (props.barChartMode === 'transactions') {
    emit('setBarChartMode', 'balance')
    return
  }
  emit('setBarChartMode', 'transactions')
}

const addPercentagesToPeriods = (periods: StatisticsPeriodDto[]) => {
  const maxTransactionsPerPeriod = Math.max(...periods.map((period) => period.fundingCount + period.withdrawCount))
  const maxAmountPerPeriod = Math.max(...periods.map((period) => Math.max(period.fundingAmount, period.withdrawAmount)))

  return periods.map((period) => ({
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

const statisticsWithPercentages = computed(() => addPercentagesToPeriods(props.statistics))
</script>
