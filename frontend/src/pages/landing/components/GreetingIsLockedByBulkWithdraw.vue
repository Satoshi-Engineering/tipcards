<template>
  <CenterContainer
    class="relative flex flex-col items-center"
    data-test="greeting-is-locked-by-bulk-withdraw"
  >
    <GreetingIcon />
    <HeadlineDefault level="h1" styling="h2">
      {{ $t('landing.introGreeting') }}
    </HeadlineDefault>
    <ParagraphDefault class="mb-4">
      {{
        cardStatus.status === CardStatusEnum.enum.bulkWithdrawPending
          ? $t('landing.bulkWithdrawPending')
          : $t('landing.bulkWithdrawExists')
      }}
    </ParagraphDefault>
    <ButtonDefault
      v-if="cardStatus.status !== CardStatusEnum.enum.bulkWithdrawPending"
      type="submit"
      variant="outline"
      data-test="reset-bulk-withdraw"
      :disabled="resettingBulkWithdraw"
      @click="$emit('resetBulkWithdraw')"
    >
      {{ $t('bulkWithdraw.buttonReset') }}
    </ButtonDefault>
  </CenterContainer>
</template>

<script setup lang="ts">
import type { PropType } from 'vue'

import ButtonDefault from '@/components/buttons/ButtonDefault.vue'
import CenterContainer from '@/components/layout/CenterContainer.vue'
import HeadlineDefault from '@/components/typography/HeadlineDefault.vue'
import ParagraphDefault from '@/components/typography/ParagraphDefault.vue'
import { CardStatusEnum, type CardStatusDto } from '@shared/data/trpc/CardStatusDto'
import GreetingIcon from './GreetingIcon.vue'

defineProps({
  cardStatus: {
    type: Object as PropType<CardStatusDto>,
    required: true,
  },
  resettingBulkWithdraw: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['resetBulkWithdraw'])
</script>
