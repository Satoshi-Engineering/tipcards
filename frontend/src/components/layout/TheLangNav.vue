<template>
  <nav class="w-full h-[calc(100dvh-56px)] overflow-y-auto pt-0 bg-white">
    <CenterContainer>
      <ul class="">
        <li
          v-for="(locale, index) in locales"
          :key="locale.code"
          :class="{ 'font-bold text-yellow': locale.code === currentLocale, 'border-t border-white-50' : index !== 0 }"
        >
          <RouterLink
            :to="{ ...$route, params: { ...$route.params, lang: locale.code } }"
            :hreflang="locale.code"
            rel="alternate"
            class="block py-3 pl-4 text-lg hover:underline"
            @click="() => emit('itemSelected')"
          >
            {{ locale.name }}
          </RouterLink>
        </li>
      </ul>
    </CenterContainer>
  </nav>
</template>

<script setup lang="ts">

import { type PropType } from 'vue'

import CenterContainer from '@/components/layout/CenterContainer.vue'
import type { Locales } from '@/modules/langNav/Locales'

const emit = defineEmits(['itemSelected'])

defineProps({
  locales: {
    type: Array as PropType<Locales>,
    default: () => [],
  },
  currentLocale: {
    type: String,
    default: '',
  },
})

</script>
