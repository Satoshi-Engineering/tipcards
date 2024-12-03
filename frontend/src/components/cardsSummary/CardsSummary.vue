<template>
  <div
    :data-test="preview ? 'cards-summary-preview' : 'cards-summary'"
    :class="{
      'opacity-50 blur-xs pointer-events-none select-none': preview,
    }"
  >
    <div class="grid grid-cols-3 gap-8 max-w-md mx-auto justify-between items-top">
      <CardsSummaryFigure
        :headline="$t('cards.status.labelUsed')"
        :amount="cardsSummaryWithLoadingStatusComputed.cardsSummary?.withdrawn.amount"
        :count="cardsSummaryWithLoadingStatusComputed.cardsSummary?.withdrawn.count"
        data-test="cards-summary-withdrawn"
      >
        <template #icon>
          <IconSummaryRedeemed class="text-green" />
        </template>
      </CardsSummaryFigure>
      <CardsSummaryFigure
        :headline="$t('cards.status.labelFunded')"
        :amount="cardsSummaryWithLoadingStatusComputed.cardsSummary?.funded.amount"
        :count="cardsSummaryWithLoadingStatusComputed.cardsSummary?.funded.count"
        data-test="cards-summary-funded"
      >
        <template #icon>
          <IconSummaryCharged class="text-yellow" />
        </template>
      </CardsSummaryFigure>
      <CardsSummaryFigure
        :headline="$t('cardsSummary.total')"
        :amount="totalAmount"
        :count="totalCount"
        data-test="cards-summary-total"
      >
        <template #icon>
          <IconSummaryEmptyCard class="text-grey-dark" />
        </template>
      </CardsSummaryFigure>
    </div>
    <UserErrorMessages
      class="mb-2 text-center"
      data-test="cards-summary-error-messages"
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

const totalAmount = computed(() => {
  if (cardsSummaryWithLoadingStatusComputed.value.cardsSummary != null) {
    return (
      cardsSummaryWithLoadingStatusComputed.value.cardsSummary.funded.amount
      + cardsSummaryWithLoadingStatusComputed.value.cardsSummary.withdrawn.amount
      + cardsSummaryWithLoadingStatusComputed.value.cardsSummary.unfunded.amount
      // do NOT add the userActionRequired amount to the total amount because unpaid invoices would be included
    )
  }
  return undefined
})

const totalCount = computed(() => {
  if (cardsSummaryWithLoadingStatusComputed.value.cardsSummary != null) {
    return (
      cardsSummaryWithLoadingStatusComputed.value.cardsSummary.funded.count
      + cardsSummaryWithLoadingStatusComputed.value.cardsSummary.withdrawn.count
      + cardsSummaryWithLoadingStatusComputed.value.cardsSummary.unfunded.count
      + cardsSummaryWithLoadingStatusComputed.value.cardsSummary.userActionRequired.count
    )
  }
  return undefined
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
      userActionRequired: {
        amount: 0,
        count: 0,
      },
    },
  }
})
</script>
