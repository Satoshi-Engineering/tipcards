<template>
  <div>
    <ParagraphDefault class="mb-4">
      {{ $t('bulkWithdraw.noFundedCards') }}
    </ParagraphDefault>
    <ButtonDefault
      variant="outline"
      :href="router.resolve(to).href"
      @click="onBacklinkClick"
    >
      {{ $t('general.back') }}
    </ButtonDefault>
  </div>
</template>

<script lang="ts" setup>
import { useRouter } from 'vue-router'

import ParagraphDefault from '@/components/typography/ParagraphDefault.vue'
import ButtonDefault from '@/components/buttons/ButtonDefault.vue'
import useBacklink from '@/modules/useBackLink'

const router = useRouter()

const { to, onBacklinkClick } = useBacklink()
</script>
