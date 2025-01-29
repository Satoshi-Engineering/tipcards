<template>
  <ItemsListItem
    data-test="card-status-list-item"
  >
    <template #preHeadline>
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
        <CardStatusPill
          :status="cardStatus.status"
          class="-ms-0.5"
        />
      </LinkDefault>
    </template>
    <template #headline>
      <LinkDefault
        invert-underline
        no-bold
        data-test="card-status-list-item-name"
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
    </template>
    <template #default>
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
          <template v-if="cardStatus.setName != null && cardStatus.setName !== ''">
            {{ cardStatus.setName }}
          </template>
          <span v-else class="italic">
            {{ $t('sets.unnamedSetNameFallback') }}
          </span>
        </LinkDefault>
      </div>
    </template>
    <template #bottomEnd>
      {{ $t('general.amountAndUnitSats', { amount: amountToDisplay }, amountToDisplay || 0) }}
    </template>
  </ItemsListItem>
</template>

<script setup lang="ts">
import { computed, type PropType } from 'vue'

import type { CardStatusForHistoryDto } from '@shared/data/trpc/CardStatusForHistoryDto'
import { CardsSummaryCategoriesEnum } from '@shared/data/trpc/CardsSummaryDto'
import { getCardsSummaryStatusCategoryForCardStatus } from '@shared/modules/statusCategoryHelpers'

import { cardStatusesUnpaidInvoices } from '@/data/cardStatusesUnpaidInvoices'
import LinkDefault from '@/components/typography/LinkDefault.vue'
import { dateWithTimeFormat } from '@/utils/dateFormats'
import CardStatusPill from './CardStatusPill.vue'
import ItemsListItem from '@/components/itemsList/ItemsListItem.vue'

const props = defineProps({
  cardStatus: {
    type: Object as PropType<CardStatusForHistoryDto>,
    required: true,
  },
})

const isCategoryUserActionRequired = computed(() =>
  getCardsSummaryStatusCategoryForCardStatus(props.cardStatus.status) === CardsSummaryCategoriesEnum.enum.userActionRequired,
)

const amountToDisplay = computed(() => {
  if (props.cardStatus.status == null || props.cardStatus.amount == null || props.cardStatus.feeAmount == null) {
    return undefined
  }
  if (cardStatusesUnpaidInvoices.includes(props.cardStatus.status)) {
    return props.cardStatus.amount + props.cardStatus.feeAmount
  }
  return props.cardStatus.amount
})
</script>
