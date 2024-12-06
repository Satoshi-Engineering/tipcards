<template>
  <div
    class="grid grid-cols-[1fr,auto] grid-rows-[repeat(3,auto)]"
    data-test="card-status-list-item"
  >
    <CardStatusPill
      :status="cardStatus.status"
      class="col-start-1 place-self-start -ms-0.5"
    />

    <HeadlineDefault
      level="h4"
      data-test="card-status-list-item-name"
      class="col-start-1 !my-2"
    >
      <LinkDefault
        invert-underline
        no-bold
        :to="{
          name: 'landing',
          params: {
            cardHash: cardStatus.hash,
            lang: $route.params.lang,
          }
        }"
      >
        {{ cardStatus.noteForStatusPage || cardStatus.textForWithdraw }}
      </LinkDefault>
    </HeadlineDefault>

    <div class="col-start-1 text-sm">
      <div v-if="cardStatus.withdrawn != null">
        {{ $t('cardStatus.withdrawn') }}:
        <time data-test="card-status-list-item-date-withdrawn">
          {{ $d(cardStatus.withdrawn, dateWithTimeFormat) }}
        </time>
      </div>
      <div v-else-if="cardStatus.bulkWithdrawCreated">
        {{ $t('cardStatus.bulkWithdrawCreated') }}:
        <time data-test="card-status-list-item-date-bulkWithdrawCreated">
          {{ $d(cardStatus.bulkWithdrawCreated, dateWithTimeFormat) }}
        </time>
      </div>
      <div v-else-if="cardStatus.landingPageViewed">
        {{ $t('cardStatus.landingPageViewed') }}:
        <time data-test="card-status-list-item-date-landingPageViewed">
          {{ $d(cardStatus.landingPageViewed, dateWithTimeFormat) }}
        </time>
      </div>
      <div v-if="cardStatus.funded != null">
        {{ $t('cardStatus.funded') }}:
        <time data-test="card-status-list-item-date-funded">
          {{ $d(cardStatus.funded, dateWithTimeFormat) }}
        </time>
      </div>
      <div v-else>
        {{ $t('cardStatus.created') }}:
        <time data-test="card-status-list-item-date-created">
          {{ $d(cardStatus.created, dateWithTimeFormat) }}
        </time>
      </div>
      <div v-if="isCategoryUserActionRequired && cardStatus.setName != null && cardStatus.setId != null" class="mt-0.5">
        {{ $t('general.set') }}:
        <LinkDefault
          data-test="card-status-list-item-setLink"
          no-bold
          :to="{
            name: 'set',
            params: {
              setId: cardStatus.setId,
              lang: $route.params.lang,
            }
          }"
        >
          {{ cardStatus.setName === '' ? $t('sets.unnamedSetNameFallback') : cardStatus.setName }}
        </LinkDefault>
      </div>
    </div>
    <div
      v-if="cardStatus.amount != null"
      class="-col-end-1 -row-end-1 mb-1 place-self-end text-sm font-bold"
    >
      {{ $t('general.amountAndUnitSats', { amount: cardStatus.amount }, cardStatus.amount) }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, type PropType } from 'vue'

import type { CardStatusForHistoryDto } from '@shared/data/trpc/CardStatusForHistoryDto'
import { CardsSummaryCategoriesEnum } from '@shared/data/trpc/CardsSummaryDto'
import { getCardsSummaryStatusCategoryForCardStatus } from '@shared/modules/statusCategoryHelpers'

import LinkDefault from '@/components/typography/LinkDefault.vue'
import HeadlineDefault from '@/components/typography/HeadlineDefault.vue'
import { dateWithTimeFormat } from '@/utils/dateFormats'
import CardStatusPill from './CardStatusPill.vue'

const props = defineProps({
  cardStatus: {
    type: Object as PropType<CardStatusForHistoryDto>,
    required: true,
  },
})

const isCategoryUserActionRequired = computed(() =>
  getCardsSummaryStatusCategoryForCardStatus(props.cardStatus.status) === CardsSummaryCategoriesEnum.enum.userActionRequired,
)
</script>
