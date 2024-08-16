<template>
  <label class="block mb-4 last:mb-0">
    <h4 class="mb-1 font-lato">
      {{ label }}
    </h4>
    <small
      v-if="description != null"
      class="block mb-1"
    >
      {{ description }}
    </small>
    <input
      v-model="model"
      class="w-full my-1 px-3 py-2 border border-[#c4c4c4] rounded-lg focus:outline-none"
      :type="type"
    >
  </label>
</template>

<script setup lang="ts">
import type { PropType } from 'vue'

const model = defineModel({
  type: String,
})

defineProps({
  label: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: undefined,
  },
  type: {
    type: String as PropType<'email' | 'text' | 'password'>,
    default: 'text',
  },
})
</script>
