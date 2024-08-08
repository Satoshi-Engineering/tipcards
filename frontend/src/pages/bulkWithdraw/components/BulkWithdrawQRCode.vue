<template>
  <div>
    <ParagraphDefault class="mt-4">
      {{ $t('bulkWithdraw.description') }}
    </ParagraphDefault>

    <LightningQrCode
      class="my-7"
      :value="bulkWithdraw.lnurl"
      :success="bulkWithdraw.withdrawn != null"
      :pending="bulkWithdraw.withdrawPending || resetting"
    />
    <div class="flex justify-center">
      <ButtonDefault
        v-if="bulkWithdraw.withdrawn"
        variant="outline"
        :href="router.resolve(to).href"
        @click="onBacklinkClick"
      >
        {{ $t('general.back') }}
      </ButtonDefault>
      <ButtonWithTooltip
        v-else
        type="submit"
        variant="outline"
        :disabled="resetting"
        @click="$emit('reset')"
      >
        {{ $t('bulkWithdraw.buttonReset') }}
      </ButtonWithTooltip>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { PropType } from 'vue'
import { useRouter } from 'vue-router'

import type { BulkWithdraw } from '@shared/data/trpc/BulkWithdraw'

import ParagraphDefault from '@/components/typography/ParagraphDefault.vue'
import ButtonDefault from '@/components/buttons/ButtonDefault.vue'
import ButtonWithTooltip from '@/components/ButtonWithTooltip.vue'
import LightningQrCode from '@/components/LightningQrCode.vue'
import useBacklink from '@/modules/useBackLink'

defineProps({
  bulkWithdraw: {
    type: Object as PropType<BulkWithdraw>,
    required: true,
  },
  resetting: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['reset'])

const router = useRouter()

const { to, onBacklinkClick } = useBacklink()
</script>
