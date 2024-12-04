<template>
  <section class="flow-root shadow-default rounded-default">
    <header class="flex gap-3 border-b border-white-50 py-4 px-5">
      <slot name="header" />
    </header>

    <slot name="beforeList" />

    <ul v-if="items.length > 0">
      <li
        v-for="(item, index) in items"
        :key="index"
        class="mx-5 border-b border-white-50 group last:border-0"
      >
        <slot name="default" :item="item" />
      </li>
    </ul>

    <slot name="afterList" />
  </section>
</template>

<script setup lang="ts" generic="T">
import type { PropType } from 'vue'

defineProps({
  items: {
    type: Array as PropType<T[]>,
    required: true,
  },
})
</script>
