<template>
  <div>
    <p class="mb-4">
      ⚠️ {{ $t('bulkWithdraw.withdrawExists') }}
    </p>
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
import ButtonWithTooltip from '@/components/ButtonWithTooltip.vue'

defineProps({
  restarting: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['restart'])
</script>
