<template>
  <div class="grid grid-cols-3 gap-8 max-w-md mx-auto justify-between items-center">
    <figure class="text-center">
      <IconSummaryRedeemed class="mx-auto w-8 h-8 text-green" />
      <figcaption class="my-2">
        <HeadlineDefault level="h4" class="text-sm">
          {{ $t('cards.status.labelUsed') }}
        </HeadlineDefault>
        <div class="text-lg font-medium">
          <template v-if="cardsSummaryWithLoadingStatus.status === 'success'">
            {{ cardsSummaryWithLoadingStatus.cardsSummary.withdrawn.amount }} sats
          </template>
          <tempalte v-else>
            -
          </tempalte>
        </div>
      </figcaption>
    </figure>
    <figure class="text-center">
      <IconSummaryCharged class="mx-auto w-8 h-8 text-yellow" />
      <figcaption class="my-2">
        <HeadlineDefault level="h4" class="text-sm">
          {{ $t('cards.status.labelFunded') }}
        </HeadlineDefault>
        <div class="text-lg font-medium">
          <template v-if="cardsSummaryWithLoadingStatus.status === 'success'">
            {{ cardsSummaryWithLoadingStatus.cardsSummary.funded.amount }} sats
          </template>
          <tempalte v-else>
            -
          </tempalte>
        </div>
      </figcaption>
    </figure>
    <figure class="text-center">
      <IconSummaryEmptyCard class="mx-auto w-8 h-8 text-grey-dark" />
      <figcaption class="my-2">
        <HeadlineDefault level="h4" class="text-sm">
          {{ $t('cards.status.labelUnused') }}
        </HeadlineDefault>
        <div class="text-lg font-medium">
          <template v-if="cardsSummaryWithLoadingStatus.status === 'success'">
            {{ cardsSummaryWithLoadingStatus.cardsSummary.unfunded.count }} cards
          </template>
          <tempalte v-else>
            -
          </tempalte>
        </div>
      </figcaption>
    </figure>
  </div>
</template>

<script setup lang="ts">
import type { PropType } from 'vue'

import IconSummaryCharged from '@/components/icons/IconSummaryCharged.vue'
import IconSummaryEmptyCard from '@/components/icons/IconSummaryEmptyCard.vue'
import IconSummaryRedeemed from '@/components/icons/IconSummaryRedeemed.vue'
import HeadlineDefault from '@/components/typography/HeadlineDefault.vue'
import type { CardsSummaryWithLoadingStatus } from '@/data/CardsSummaryWithLoadingStatus'

defineProps({
  cardsSummaryWithLoadingStatus: {
    type: Object as PropType<CardsSummaryWithLoadingStatus>,
    required: true,
  },
})
</script>
