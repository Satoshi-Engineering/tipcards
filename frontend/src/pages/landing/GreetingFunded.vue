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
    <ParagraphDefault class="mb-10 text-center">
      <I18nT keypath="landing.introMessage">
        <template #linebreak>
          <br>
        </template>
      </I18nT>
    </ParagraphDefault>
    <div
      v-if="cardStatus.amount != null"
      class="w-[250px] mb-5 p-2 flex flex-col items-center border border-yellow rounded-default"
    >
      <span class="font-bold">
        <FormatBitcoin
          leading-zeros-class="text-white-50"
          :value="cardStatus.amount / (100 * 1000 * 1000)"
          :format="{ minimumFractionDigits: 8, maximumFractionDigits: 8 }"
        />
        BTC
      </span>
      <span v-if="amountInFiat != null" class="mt-1 text-xs">
        {{
          $n(amountInFiat, {
            style: 'currency',
            currency: currentFiat,
            currencyDisplay: 'code',
          })
        }}
      </span>
    </div>
    <CollapsibleElement
      level="h4"
      class="w-[250px]"
      hover-press-effect
      :title="$t('landing.sectionBitcoin.title')"
    >
      <IconLogoBitcoin class="w-16 mb-3 ltr:float-right ltr:ml-3 rtl:float-left rtl:mr-3" />
      <!-- eslint-disable vue/no-v-html, vue/no-v-text-v-html-on-component -->
      <ParagraphDefault v-html="sanitizeI18n($t('landing.sectionBitcoin.paragraphs.0'))" />
      <ParagraphDefault v-html="sanitizeI18n($t('landing.sectionBitcoin.paragraphs.1'))" />
      <ParagraphDefault v-html="sanitizeI18n($t('landing.sectionBitcoin.paragraphs.2'))" />
      <!-- eslint-enable vue/no-v-html, vue/no-v-text-v-html-on-component -->
    </CollapsibleElement>
  </CenterContainer>
</template>

<script setup lang="ts">
import { computed, type PropType } from 'vue'

import type { CardStatusDto } from '@shared/data/trpc/tipcards/CardStatusDto'

import IconLightningBolt from '@/components/icons/IconLightningBolt.vue'
import IconLogoBitcoin from '@/components/icons/IconLogoBitcoin.vue'
import CenterContainer from '@/components/layout/CenterContainer.vue'
import HeadlineDefault from '@/components/typography/HeadlineDefault.vue'
import ParagraphDefault from '@/components/typography/ParagraphDefault.vue'
import CollapsibleElement from '@/components/CollapsibleElement.vue'
import FormatBitcoin from '@/components/FormatBitcoin.vue'
import { useI18nHelpers } from '@/modules/initI18n'
import { rateBtcFiat } from '@/modules/rateBtcFiat'
import sanitizeI18n from '@/modules/sanitizeI18n'

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
