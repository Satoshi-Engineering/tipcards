<template>
  <div class="flex space-between">
    <div class="ms-auto flex-1 flex gap-1 align-center">
      <ButtonIcon
        icon="search"
        size="small"
        variant="yellow"
        data-test="button-new-set"
      />
      <input
        type="search"
        :placeholder="$t('general.search')"
        class="flex-auto px-2 border-b bg-none border-bluegrey focus:outline-none"
        @input="$emit('textSearch', ($event.target as HTMLInputElement).value)"
      >
    </div>
  </div>
</template>

<script setup lang="ts">
import ButtonIcon from '@/components/buttons/ButtonIcon.vue'

defineEmits(['textSearch'])
</script>
