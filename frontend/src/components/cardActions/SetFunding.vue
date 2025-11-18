<template>
  <div>
    <HeadlineDefault level="h3" class="mb-2">
      {{ t('cards.actions.setFunding.headline') }}
    </HeadlineDefault>
    <ParagraphDefault class="text-sm">
      {{ t('cards.actions.setFunding.intro') }}
    </ParagraphDefault>
    <div class="mb-2">
      {{ t('cards.actions.setFunding.label') }}:
    </div>
    <ButtonContainer>
      <ButtonWithTooltip
        :href="buttonHref"
        :disabled="buttonDisabled"
        :tooltip="buttonDisabled ? t('cards.actions.setFunding.disabledReason') : undefined"
        data-test="start-set-funding"
      >
        {{ t('cards.actions.setFunding.button') }}
      </ButtonWithTooltip>
    </ButtonContainer>
  </div>
</template>

<script lang="ts" setup>
import { computed, type PropType } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

import type { Set } from '@shared/data/api/Set'

import HeadlineDefault from '@/components/typography/HeadlineDefault.vue'
import ParagraphDefault from '@/components/typography/ParagraphDefault.vue'
import ButtonWithTooltip from '@/components/ButtonWithTooltip.vue'
import ButtonContainer from '@/components/buttons/ButtonContainer.vue'
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
const router = useRouter()

const { setFundingHref, setFundingDisabled } = useSetFunding()

const buttonHref = computed(() => {
  if (props.cards.length > 1) {
    return setFundingHref.value
  } else if (props.cards.length === 1) {
    return router.resolve({ name: 'funding', params: { cardHash: props.cards[0].cardHash } }).href
  }
  return ''
})

const buttonDisabled = computed(() => setFundingDisabled(props.cards, props.set))
</script>
