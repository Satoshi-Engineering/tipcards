<template>
  <ItemsListWithMessages
    :items="cardStatuses"
    :header-primary="$t('cards.cardInfo')"
    :header-secondary="$t('general.amount')"
  >
    <template #default="{ item: cardStatus }">
      <CardStatusListItem
        class="-mx-5 px-5 py-4 group-last:pb-6 group-last:rounded-b-default"
        :card-status="cardStatus"
      />
    </template>
  </ItemsListWithMessages>
</template>

<script setup lang="ts">
import type { PropType } from 'vue'

import type { CardStatusForHistoryDto } from '@shared/data/trpc/CardStatusForHistoryDto'

import ItemsListWithMessages from '@/components/itemsList/ItemsListWithMessages.vue'
import CardStatusListItem from './components/CardStatusListItem.vue'

defineProps({
  cardStatuses: {
    type: Array as PropType<CardStatusForHistoryDto[]>,
    required: true,
  },
})
</script>
