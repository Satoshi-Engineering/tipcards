<template>
  <div>
    <div class="grid grid-cols-3 gap-8 max-w-md mx-auto justify-between items-top">
      <CardsSummaryFigure
        :headline="$t('cards.status.labelUsed')"
        :amount="cardsSummaryWithLoadingStatus.status === 'success' ? cardsSummaryWithLoadingStatus.cardsSummary.withdrawn.amount : undefined"
        :count="cardsSummaryWithLoadingStatus.status === 'success' ? cardsSummaryWithLoadingStatus.cardsSummary.withdrawn.count : undefined"
      >
        <template #icon>
          <IconSummaryRedeemed class="text-green" />
        </template>
      </CardsSummaryFigure>
      <CardsSummaryFigure
        :headline="$t('cards.status.labelFunded')"
        :amount="cardsSummaryWithLoadingStatus.status === 'success' ? cardsSummaryWithLoadingStatus.cardsSummary.funded.amount : undefined"
        :count="cardsSummaryWithLoadingStatus.status === 'success' ? cardsSummaryWithLoadingStatus.cardsSummary.funded.count : undefined"
      >
        <template #icon>
          <IconSummaryCharged class="text-yellow" />
        </template>
      </CardsSummaryFigure>
      <CardsSummaryFigure
        :headline="$t('cards.status.labelUnused')"
        :amount="cardsSummaryWithLoadingStatus.status === 'success' ? cardsSummaryWithLoadingStatus.cardsSummary.unfunded.amount : undefined"
        :count="cardsSummaryWithLoadingStatus.status === 'success' ? cardsSummaryWithLoadingStatus.cardsSummary.unfunded.count : undefined"
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
import type { PropType } from 'vue'

import IconSummaryCharged from '@/components/icons/IconSummaryCharged.vue'
import IconSummaryEmptyCard from '@/components/icons/IconSummaryEmptyCard.vue'
import IconSummaryRedeemed from '@/components/icons/IconSummaryRedeemed.vue'
import type { CardsSummaryWithLoadingStatus } from '@/data/CardsSummaryWithLoadingStatus'
import CardsSummaryFigure from '@/components/cardsSummary/components/CardsSummaryFigure.vue'
import UserErrorMessages from '../UserErrorMessages.vue'

defineProps({
  cardsSummaryWithLoadingStatus: {
    type: Object as PropType<CardsSummaryWithLoadingStatus>,
    required: true,
  },
  userErrorMessages: {
    type: Array as PropType<string[]>,
    default: () => [],
  },
})
</script>
