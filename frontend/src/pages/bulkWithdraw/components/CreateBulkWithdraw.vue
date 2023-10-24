<template>
  <div>
    <p class="mt-4">
      {{ $t('bulkWithdraw.description') }}
    </p>

    <ButtonDefault
      class="mt-4"
      :loading="creating"
      :disabled="creating"
      @click="$emit('create')"
    >
      {{ $t('bulkWithdraw.buttonCreate') }}
    </ButtonDefault>
  </div>
</template>

<script lang="ts" setup>
import ButtonDefault from '@/components/ButtonDefault.vue'

defineProps({
  creating: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['create'])
</script>
