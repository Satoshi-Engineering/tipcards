<template>
  <div>
    <p class="mb-4">
      {{ $t('bulkWithdraw.withdrawExists') }}
    </p>
    <ButtonWithTooltip
      type="submit"
      variant="outline"
      :disabled="resetting"
      @click="$emit('reset')"
    >
      {{ $t('bulkWithdraw.buttonReset') }} 
    </ButtonWithTooltip>
  </div>
</template>

<script lang="ts" setup>
import ButtonWithTooltip from '@/components/ButtonWithTooltip.vue'

defineProps({
  resetting: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['reset'])
</script>
