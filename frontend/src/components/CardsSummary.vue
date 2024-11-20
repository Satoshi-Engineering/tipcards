<template>
  <div class="grid grid-cols-3 gap-8 max-w-md mx-auto justify-between items-center">
    <figure class="text-center">
      <IconSummaryRedeemed class="mx-auto w-8 h-8 text-green" />
      <figcaption class="my-2">
        <HeadlineDefault level="h4" class="text-sm">
          {{ $t('cards.status.labelUsed') }}
        </HeadlineDefault>
        <div class="text-lg font-medium">
          20 sats
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
          20 sats
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
          20 sats
        </div>
      </figcaption>
    </figure>
  </div>
</template>
<script setup lang="ts">
import type { PropType } from 'vue'

import type { CardsSummaryWithLoadingStatus } from '@/stores/sets'
import IconSummaryCharged from './icons/IconSummaryCharged.vue'
import IconSummaryEmptyCard from './icons/IconSummaryEmptyCard.vue'
import IconSummaryRedeemed from './icons/IconSummaryRedeemed.vue'
import HeadlineDefault from './typography/HeadlineDefault.vue'

defineProps({
  cardsSummary: {
    type: Object as PropType<CardsSummaryWithLoadingStatus>,
    required: true,
  },
})
</script>
