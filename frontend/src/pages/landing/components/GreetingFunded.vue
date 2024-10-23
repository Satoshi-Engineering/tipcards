<template>
  <CenterContainer class="relative items-center">
    <GreetingIcon />
    <HeadlineDefault
      level="h1"
      class="text-center"
      data-test="greeting-funded-headline"
    >
      {{ $t('landing.introGreetingFunded') }}
    </HeadlineDefault>
    <ParagraphDefault class="mb-10 text-center">
      <I18nT keypath="landing.introMessage">
        <template #linebreak>
          <br>
        </template>
      </I18nT>
    </ParagraphDefault>
    <div
      v-if="cardStatus.amount != null"
      class="mb-5 p-2 md:p-5 border border-yellow rounded-default text-center md:text-2xl"
      data-test="greeting-funded-bitcoin-amount"
    >
      <div class="font-bold">
        <FormatBitcoin
          leading-zeros-class="text-white-50"
          :value="cardStatus.amount / (100 * 1000 * 1000)"
          :format="{ minimumFractionDigits: 8, maximumFractionDigits: 8 }"
        />
        BTC
      </div>
      <div v-if="amountInFiat != null" class="mt-1 text-xs md:text-base">
        {{
          $n(amountInFiat, {
            style: 'currency',
            currency: currentFiat,
            currencyDisplay: 'code',
          })
        }}
      </div>
    </div>
  </CenterContainer>
</template>

<script setup lang="ts">
import { computed, type PropType } from 'vue'

import type { CardStatusDto } from '@shared/data/trpc/CardStatusDto'

import CenterContainer from '@/components/layout/CenterContainer.vue'
import HeadlineDefault from '@/components/typography/HeadlineDefault.vue'
import ParagraphDefault from '@/components/typography/ParagraphDefault.vue'
import FormatBitcoin from '@/components/FormatBitcoin.vue'
import { useI18nHelpers } from '@/modules/initI18n'
import { rateBtcFiat } from '@/modules/rateBtcFiat'
import GreetingIcon from './GreetingIcon.vue'

const props = defineProps({
  cardStatus: {
    type: Object as PropType<CardStatusDto>,
    required: true,
  },
})

const { currentFiat } = useI18nHelpers()

const amountInFiat = computed(() => {
  if (
    props.cardStatus.amount == null
    || rateBtcFiat.value == null
    || rateBtcFiat.value[currentFiat.value] == null
  ) {
    return undefined
  }
  return (props.cardStatus.amount / (100_000_000)) * rateBtcFiat.value[currentFiat.value]
})
</script>
