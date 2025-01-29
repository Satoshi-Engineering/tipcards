<template>
  <ItemsListItem
    :data-test="
      openTask.cardStatus === CardStatusEnum.enum.isLockedByBulkWithdraw
        ? 'open-bulk-withdraw-task'
        : 'open-set-funding-task'
    "
    :data-test-set-id="openTask.setId"
    :to="{
      name: openTask.cardStatus === CardStatusEnum.enum.isLockedByBulkWithdraw
        ? 'bulk-withdraw'
        : 'set-funding',
      params: {
        setId: openTask.setId,
        settings: encodeCardsSetSettingsFromDto(openTask.setSettings),
        lang: $route.params.lang,
      }
    }"
  >
    <template #preHeadline>
      <CardStatusPill
        :status="openTask.cardStatus"
      />
    </template>
    <template #headline>
      <template v-if="openTask.setSettings.name != null && openTask.setSettings.name !== ''">
        {{ openTask.setSettings.name }}
      </template>
      <span v-else class="italic">
        {{ $t('sets.unnamedSetNameFallback') }}
      </span>
    </template>
    <template #default>
      <div>
        {{ $t('general.cards', {count: openTask.cardCount }, openTask.cardCount) }}
      </div>
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

import { OpenSetTaskDto } from '@shared/data/trpc/OpenTaskDto'
import { CardStatusEnum } from '@shared/data/trpc/CardStatusDto'

import getDisplayAmount from '@/data/getDisplayAmount'
import { encodeCardsSetSettingsFromDto } from '@/utils/cardsSetSettings'
import { dateWithTimeFormat } from '@/utils/dateFormats'
import ItemsListItem from '@/components/itemsList/ItemsListItem.vue'
import CardStatusPill from '@/components/cardStatusList/components/CardStatusPill.vue'

const props = defineProps({
  openTask: {
    type: Object as PropType<OpenSetTaskDto>,
    required: true,
  },
})

const amountToDisplay = computed(() => getDisplayAmount({ cardStatus: props.openTask.cardStatus, amount: props.openTask.amount, feeAmount: props.openTask.feeAmount }))
</script>
