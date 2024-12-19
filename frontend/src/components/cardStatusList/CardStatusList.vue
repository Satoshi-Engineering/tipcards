<template>
  <ItemsListWithMessages
    :items="cardStatuses"
    :header-primary="$t('cards.cardInfo')"
    :header-secondary="$t('general.amount')"
    :loading="loading"
    :reloading="reloading"
    :not-logged-in="notLoggedIn"
    data-test="card-status-list"
  >
    <template #default="{ item: cardStatus }">
      <CardStatusListItem
        class="-mx-5 px-5 py-4 group-last:pb-6 group-last:rounded-b-default"
        :card-status="cardStatus"
      />
    </template>
    <template #notLoggedInMessage>
      <CardStatusListMessageNotLoggedIn />
    </template>
  </ItemsListWithMessages>
</template>

<script setup lang="ts">
import type { PropType } from 'vue'

import type { CardStatusForHistoryDto } from '@shared/data/trpc/CardStatusForHistoryDto'

import ItemsListWithMessages from '@/components/itemsList/ItemsListWithMessages.vue'
import CardStatusListItem from './components/CardStatusListItem.vue'
import CardStatusListMessageNotLoggedIn from './components/CardStatusListMessageNotLoggedIn.vue'

defineProps({
  cardStatuses: {
    type: Array as PropType<CardStatusForHistoryDto[]>,
    required: true,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  reloading: {
    type: Boolean,
    default: false,
  },
  notLoggedIn: {
    type: Boolean,
    default: false,
  },
})
</script>
