<template>
  <label class="block mb-4 last:mb-0" :class="$attrs.class">
    <span class="block mb-1 font-lato text-black font-bold">
      {{ label }}
    </span>
    <small
      v-if="description != null"
      class="block mb-1"
    >
      {{ description }}
    </small>
    <input
      v-model="modelValue"
      v-bind="filteredAttrs"
      :class="$attrs.inputClass"
      class="w-full my-1 px-3 py-3 border border-[#c4c4c4] focus:border-black rounded-lg focus:outline-none"
      :type="type"
    >
  </label>
</template>

<script setup lang="ts">
import { computed, useAttrs, type PropType } from 'vue'

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
    type: String as PropType<'email' | 'text' | 'password' | 'number' | 'file'>,
    default: 'text',
  },
})

const modelValue = defineModel({
  type: [String, Number] as PropType<string | number>,
})

const attrs = useAttrs()
const filteredAttrs = computed(() => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { class: _classAttr, inputClass: _inputClassAttr, ...rest } = attrs
  return rest
})
</script>
