<template>
  <CenterContainer class="py-0">
    <div class="relative">
      <ul class="absolute bg-white pt-1 w-full max-h-[calc(100dvh-63px)] overflow-y-auto">
        <li
          v-for="(locale, index) in locales"
          :key="locale.code"
          :class="{ 'font-bold text-yellow': locale.code === currentLocale, 'border-t border-white-50' : index !== 0 }"
        >
          <router-link
            :to="{ ...$route, params: { ...$route.params, lang: locale.code } }"
            :hreflang="locale.code"
            rel="alternate"
            @click="() => emit('itemSelected')"
          >
            <div class="py-3 text-lg hover:underline">
              <div class="pl-4">
                {{ locale.name }}
              </div>
            </div>
          </router-link>
        </li>
      </ul>
    </div>
  </CenterContainer>
</template>

<script setup lang="ts">
/*
  // FIL: - Questions

  // FIL:
  // FIL: Component Test
  - Wichtigste Active State: NavBar Button, LangNav Button
  - Header: ToggleButton Hover with underline and text yellow --> NavBarToggleButton
  - LangNav: ButtonHover --> MenuButton with ComponentTest

  // FIL: Integration Test
  - Header: On Select --> Close Ja --> integration Test
  - LangNav: change the menu & language
*/

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
