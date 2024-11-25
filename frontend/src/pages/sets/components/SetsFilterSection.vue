<template>
  <div class="flex space-between">
    <label class="ms-auto flex-1 flex gap-1 align-center">
      <ButtonIcon
        icon="search"
        size="small"
        variant="yellow"
        element="span"
      />
      <input
        type="search"
        data-test="input-search"
        :placeholder="$t('general.search')"
        class="flex-auto px-2 border-b border-bluegrey focus:outline-none appearance-none bg-transparent rounded-none"
        @input="$emit('textSearch', ($event.target as HTMLInputElement).value)"
      >
    </label>
  </div>
</template>

<script setup lang="ts">
import ButtonIcon from '@/components/buttons/ButtonIcon.vue'

defineEmits(['textSearch'])
</script>
