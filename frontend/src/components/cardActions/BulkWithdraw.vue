<template>
  <div>
    <HeadlineDefault level="h3" class="mb-2">
      {{ t('cards.actions.bulkWithdraw.headline') }}
    </HeadlineDefault>
    <ParagraphDefault class="text-sm">
      {{ t('cards.actions.bulkWithdraw.intro') }}
    </ParagraphDefault>
    <div class="mb-2">
      {{ t('cards.actions.bulkWithdraw.label') }}:
    </div>
    <ButtonContainer>
      <ButtonWithTooltip
        :href="bulkWithdrawHref"
        :disabled="bulkWithdrawDisabled"
        :tooltip="bulkWithdrawDisabled ? t('cards.actions.bulkWithdraw.disabledReason') : undefined"
      >
        {{ t('cards.actions.bulkWithdraw.button') }}
      </ButtonWithTooltip>
    </ButtonContainer>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'

import HeadlineDefault from '@/components/typography/HeadlineDefault.vue'
import ParagraphDefault from '@/components/typography/ParagraphDefault.vue'
import ButtonWithTooltip from '@/components/ButtonWithTooltip.vue'
import ButtonContainer from '@/components/buttons/ButtonContainer.vue'

const props = defineProps({
  amountToWithdraw: {
    type: Number,
    required: true,
  },
})

const route = useRoute()
const router = useRouter()
const { t } = useI18n()

const bulkWithdrawHref = computed(() => {
  if (
    route.name !== 'cards'
    || route.params.setId == null
    || route.params.setId === ''
  ) {
    return ''
  }
  return router.resolve({
    name: 'bulk-withdraw',
    params: {
      lang: route.params.lang,
      setId: route.params.setId,
      settings: route.params.settings,
    },
  }).href
})

const bulkWithdrawDisabled = computed(() => props.amountToWithdraw === 0)
</script>
