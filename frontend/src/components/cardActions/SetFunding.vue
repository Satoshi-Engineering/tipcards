<template>
  <div class="px-4">
    <HeadlineDefault level="h3" class="mb-2">
      {{ t('cards.actions.setFunding.headline') }}
    </HeadlineDefault>
    <ParagraphDefault class="text-sm">
      {{ t('cards.actions.setFunding.intro') }}
    </ParagraphDefault>
    <div class="mb-2">
      {{ t('cards.actions.setFunding.label') }}:
    </div>
    <ButtonWithTooltip
      class="text-sm min-w-[170px]"
      :href="setFundingHref"
      :disabled="buttonDisabled"
      :tooltip="buttonDisabled ? t('cards.actions.setFunding.disabledReason') : undefined"
    >
      {{ t('cards.actions.setFunding.button') }}
    </ButtonWithTooltip>
  </div>
</template>

<script lang="ts" setup>
import { computed, type PropType } from 'vue'
import { useI18n } from 'vue-i18n'

import type { Set } from '@shared/data/redis/Set'

import HeadlineDefault from '@/components/typography/HeadlineDefault.vue'
import ParagraphDefault from '@/components/typography/ParagraphDefault.vue'
import ButtonWithTooltip from '@/components/ButtonWithTooltip.vue'
import useSetFunding, { type Card } from '@/modules/useSetFunding'

const props = defineProps({
  set: {
    type: Object as PropType<Set>,
    default: undefined,
  },
  cards: {
    type: Array as PropType<Card[]>,
    required: true,
  },
})

const { t } = useI18n()

const { setFundingHref, setFundingDisabled } = useSetFunding()

const buttonDisabled = computed(() => setFundingDisabled(props.cards, props.set))
</script>
