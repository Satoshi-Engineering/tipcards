<template>
  <div>
    <p class="mb-4">
      {{ $t('bulkWithdraw.noFundedCards') }}
    </p>
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

import useBacklink from '@/modules/useBackLink'
import ButtonDefault from '@/components/ButtonDefault.vue'

const router = useRouter()

const { to, onBacklinkClick } = useBacklink()
</script>
