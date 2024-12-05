<template>
  <LinkDefault
    ref="item"
    class="grid grid-cols-[1fr,auto] grid-rows-[repeat(3,auto)] hover:bg-grey-light"
    data-test="sets-list-item"
    no-underline
    no-bold
    :to="{
      name: 'landing',
      params: {
        cardHash: cardStatus.hash,
        lang: $route.params.lang,
      }
    }"
  >
    <CardStatusPill
      :status="cardStatus.status"
      class="col-start-1 place-self-start"
    />
    <HeadlineDefault
      level="h4"
      data-test="sets-list-item-name"
      class="col-start-1"
    >
      {{ cardStatus.noteForStatusPage || cardStatus.textForWithdraw }}
    </HeadlineDefault>
    <div class="col-start-1 text-sm">
      <div v-if="cardStatus.withdrawn != null">
        {{ $t('cardsSummary.withdrawn') }}:
        <time data-test="sets-list-item-date">
          {{ $d(cardStatus.withdrawn, dateWithTimeFormat) }}
        </time>
      </div>
      <div v-if="cardStatus.funded != null">
        {{ $t('cardsSummary.funded') }}:
        <time data-test="sets-list-item-date">
          {{ $d(cardStatus.funded, dateWithTimeFormat) }}
        </time>
      </div>
      <div v-if="cardStatus.withdrawn == null && cardStatus.funded == null">
        <time data-test="sets-list-item-date">
          {{ $d(cardStatus.created, dateWithTimeFormat) }}
        </time>
      </div>
      <div class="text-sm">
        {{ $t('general.set') }}:
        <span data-test="sets-list-item-number-of-cards">
          {{ cardStatus.setName }}
        </span>
      </div>
    </div>
    <div
      v-if="cardStatus.amount != null"
      class="-col-end-1 -row-end-1 mb-1 place-self-end text-sm font-bold"
    >
      {{ $t('general.amountAndUnitSats', { amount: cardStatus.amount }, cardStatus.amount) }}
    </div>
  </LinkDefault>
</template>

<script setup lang="ts">
import { type PropType } from 'vue'

import type { CardStatusForHistoryDto } from '@shared/data/trpc/CardStatusForHistoryDto'

import LinkDefault from '@/components/typography/LinkDefault.vue'
import HeadlineDefault from '@/components/typography/HeadlineDefault.vue'
import { dateWithTimeFormat } from '@/utils/dateFormats'
import CardStatusPill from './CardStatusPill.vue'

defineProps({
  cardStatus: {
    type: Object as PropType<CardStatusForHistoryDto>,
    required: true,
  },
})
</script>
