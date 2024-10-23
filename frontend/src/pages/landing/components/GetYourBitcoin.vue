<template>
  <CenterContainer
    class="relative flex flex-col items-center"
    data-test="get-your-bitcoin"
  >
    <HeadlineDefault level="h2">
      {{ $t('landing.sectionGetYourBitcoin.headline') }}
    </HeadlineDefault>
    <!-- eslint-disable vue/no-v-html, vue/no-v-text-v-html-on-component -->
    <ParagraphDefault
      class="text-center"
      v-html="sanitizeI18n($t('landing.sectionGetYourBitcoin.explanation'))"
    />
    <!-- eslint-enable vue/no-v-html, vue/no-v-text-v-html-on-component -->
    <LightningQrCode
      v-if="lnurl != null"
      class="my-7"
      :value="lnurl"
      :success="cardIsWithdrawn"
      :pending="cardWithdrawIsPending"
    >
      <template #headline>
        <div class="flex flex-col items-end">
          <HeadlineDefault level="h3" class="mb-0 text-right">
            {{ $t('landing.sectionGetYourBitcoin.qrCodeHeadline') }}
          </HeadlineDefault>
          <LinkDefault href="#no-wallet" class="font-normal">
            {{ $t('landing.sectionGetYourBitcoin.noWallet') }}
          </LinkDefault>
        </div>
      </template>
    </LightningQrCode>
  </CenterContainer>
</template>

<script setup lang="ts">
import { computed, type PropType } from 'vue'

import { CardStatusEnum, withdrawnStatuses, type CardStatusDto } from '@shared/data/trpc/CardStatusDto'

import CenterContainer from '@/components/layout/CenterContainer.vue'
import HeadlineDefault from '@/components/typography/HeadlineDefault.vue'
import LinkDefault from '@/components/typography/LinkDefault.vue'
import ParagraphDefault from '@/components/typography/ParagraphDefault.vue'
import LightningQrCode from '@/components/LightningQrCode.vue'
import sanitizeI18n from '@/modules/sanitizeI18n'

const props = defineProps({
  cardStatus: {
    type: Object as PropType<CardStatusDto>,
    required: true,
  },
  lnurl: {
    type: String,
    required: true,
  },
})

const cardWithdrawIsPending = computed(() => props.cardStatus.status === CardStatusEnum.enum.withdrawPending)

const cardIsWithdrawn = computed(() => withdrawnStatuses.includes(props.cardStatus.status))
</script>
