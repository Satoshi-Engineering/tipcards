<template>
  <div
    :class="{
      'opacity-50 blur-xs pointer-events-none select-none': preview,
    }"
  >
    <div class="grid grid-cols-3 gap-8 max-w-md mx-auto justify-between items-top">
      <CardsSummaryFigure
        :headline="$t('cards.status.labelUsed')"
        :amount="cardsSummaryWithLoadingStatusComputed.status === 'success' ? cardsSummaryWithLoadingStatusComputed.cardsSummary.withdrawn.amount : undefined"
        :count="cardsSummaryWithLoadingStatusComputed.status === 'success' ? cardsSummaryWithLoadingStatusComputed.cardsSummary.withdrawn.count : undefined"
      >
        <template #icon>
          <IconSummaryRedeemed class="text-green" />
        </template>
      </CardsSummaryFigure>
      <CardsSummaryFigure
        :headline="$t('cards.status.labelFunded')"
        :amount="cardsSummaryWithLoadingStatusComputed.status === 'success' ? cardsSummaryWithLoadingStatusComputed.cardsSummary.funded.amount : undefined"
        :count="cardsSummaryWithLoadingStatusComputed.status === 'success' ? cardsSummaryWithLoadingStatusComputed.cardsSummary.funded.count : undefined"
      >
        <template #icon>
          <IconSummaryCharged class="text-yellow" />
        </template>
      </CardsSummaryFigure>
      <CardsSummaryFigure
        :headline="$t('cards.status.labelUnused')"
        :amount="cardsSummaryWithLoadingStatusComputed.status === 'success' ? cardsSummaryWithLoadingStatusComputed.cardsSummary.unfunded.amount : undefined"
        :count="cardsSummaryWithLoadingStatusComputed.status === 'success' ? cardsSummaryWithLoadingStatusComputed.cardsSummary.unfunded.count : undefined"
      >
        <template #icon>
          <IconSummaryEmptyCard class="text-grey-dark" />
        </template>
      </CardsSummaryFigure>
    </div>
    <UserErrorMessages
      class="mb-2"
      :user-error-messages="userErrorMessages"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, type PropType } from 'vue'

import IconSummaryCharged from '@/components/icons/IconSummaryCharged.vue'
import IconSummaryEmptyCard from '@/components/icons/IconSummaryEmptyCard.vue'
import IconSummaryRedeemed from '@/components/icons/IconSummaryRedeemed.vue'
import type { CardsSummaryWithLoadingStatus } from '@/data/CardsSummaryWithLoadingStatus'
import CardsSummaryFigure from '@/components/cardsSummary/components/CardsSummaryFigure.vue'
import UserErrorMessages from '../UserErrorMessages.vue'

const props = defineProps({
  cardsSummaryWithLoadingStatus: {
    type: Object as PropType<CardsSummaryWithLoadingStatus>,
    required: true,
  },
  userErrorMessages: {
    type: Array as PropType<string[]>,
    default: () => [],
  },
  preview: {
    type: Boolean,
    default: false,
  },
})

const cardsSummaryWithLoadingStatusComputed = computed(() => {
  if (!props.preview) {
    return props.cardsSummaryWithLoadingStatus
  }
  return {
    status: 'success',
    cardsSummary: {
      funded: {
        amount: 0,
        count: 0,
      },
      withdrawn: {
        amount: 0,
        count: 0,
      },
      unfunded: {
        amount: 0,
        count: 0,
      },
    },
  }
})
</script>
