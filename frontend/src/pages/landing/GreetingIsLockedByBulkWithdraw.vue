<template>
  <CenterContainer class="relative mb-14 flex flex-col items-center">
    <IconLightningBolt
      class="
        absolute w-[100px] h-[150px] -top-2 -end-8
        scale-x-[-1]
        text-yellow opacity-20
      "
    />
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
import { CardStatusEnum, type CardStatusDto } from '@shared/data/trpc/tipcards/CardStatusDto'
import IconLightningBolt from '@/components/icons/IconLightningBolt.vue'

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
