<template>
  <span
    class="inline-flex px-3 py-0.5 font-bold text-xs rounded-full"
    :class="{
      'bg-blueViolet-light text-blueViolet': statusCategory === CardsSummaryCategoriesEnum.enum.userActionRequired,
      'bg-green-light text-green': statusCategory === CardsSummaryCategoriesEnum.enum.withdrawn,
      'bg-white border border-black text-black': statusCategory === CardsSummaryCategoriesEnum.enum.unfunded,
      'bg-yellow-light text-yellow-dark': statusCategory === CardsSummaryCategoriesEnum.enum.funded,
    }"
  >
    {{ statusLabel }}
  </span>
</template>

<script setup lang="ts">
import { computed, type PropType } from 'vue'
import { useI18n } from 'vue-i18n'

import { CardStatusEnum } from '@shared/data/trpc/CardStatusDto'
import { CardsSummaryCategoriesEnum } from '@shared/data/trpc/CardsSummaryDto'
import { getCardsSummaryStatusCategoryForCardStatus } from '@shared/modules/statusCategoryHelpers'

const { t }  = useI18n({ useScope: 'global' })

const props = defineProps({
  status: {
    type: String as PropType<CardStatusEnum>,
    required: true,
  },
})

const statusLabel = computed(() => t(`cardStatus.${props.status}`))
const statusCategory = computed(() => props.status != null ? getCardsSummaryStatusCategoryForCardStatus(props.status) : null)
</script>
