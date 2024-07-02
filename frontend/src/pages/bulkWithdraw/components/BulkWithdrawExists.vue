<template>
  <div>
    <ParagraphDefault class="mb-4">
      ⚠️ {{ $t('bulkWithdraw.withdrawExists') }}
    </ParagraphDefault>
    <ButtonWithTooltip
      type="submit"
      :disabled="restarting"
      @click="$emit('restart')"
    >
      {{ $t('bulkWithdraw.buttonRestart') }}
    </ButtonWithTooltip>
  </div>
</template>

<script lang="ts" setup>
import ParagraphDefault from '@/components/typography/ParagraphDefault.vue'
import ButtonWithTooltip from '@/components/ButtonWithTooltip.vue'

defineProps({
  restarting: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['restart'])
</script>
