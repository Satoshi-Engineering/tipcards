<template>
  <ItemsListItem
    data-test="open-card-task"
    :data-test-card-hash="openTask.cardHash"
    :to="{
      name: 'funding',
      params: {
        cardHash: openTask.cardHash,
        lang: $route.params.lang,
      }
    }"
  >
    <template #preHeadline>
      <CardStatusPill
        class="-ms-0.5"
        :status="openTask.cardStatus"
      />
    </template>
    <template #headline>
      {{ openTask.noteForStatusPage || openTask.textForWithdraw }}
    </template>
    <template #default>
      <div>
        {{ $t('cardStatus.created') }}:
        <time data-test="open-card-task-created">
          {{ $d(openTask.created, dateWithTimeFormat) }}
        </time>
      </div>
    </template>
    <template #bottomEnd>
      {{ $t('general.amountAndUnitSats', { amount: amountToDisplay }, amountToDisplay ?? 0) }}
    </template>
  </ItemsListItem>
</template>

<script setup lang="ts">
import { computed, type PropType } from 'vue'

import { OpenCardTaskDto } from '@shared/data/trpc/OpenTaskDto'

import getDisplayAmount from '@/data/getDisplayAmount'
import { dateWithTimeFormat } from '@/utils/dateFormats'
import ItemsListItem from '@/components/itemsList/ItemsListItem.vue'
import CardStatusPill from '@/components/cardStatusList/components/CardStatusPill.vue'

const props = defineProps({
  openTask: {
    type: Object as PropType<OpenCardTaskDto>,
    required: true,
  },
})

const amountToDisplay = computed(() => getDisplayAmount({ cardStatus: props.openTask.cardStatus, amount: props.openTask.amount, feeAmount: props.openTask.feeAmount }))
</script>
