<template>
  <ul class="pt-1">
    <li
      v-for="(locale, index) in locales"
      :key="locale.code"
      :class="{ 'font-bold text-yellow': locale.code === currentLocale, 'border-t border-white-50' : index !== 0 }"
    >
      <router-link
        :to="{ ...$route, params: { ...$route.params, lang: locale.code } }"
        :hreflang="locale.code"
        rel="alternate"
      >
        <div class="pt-4 pb-4 text-lg hover:underline">
          <div class="pl-4">
            {{ locale.name }}
          </div>
        </div>
      </router-link>
    </li>
  </ul>
</template>

<script setup lang="ts">
/*
  // FIL: - Questions

  // FIL:
  - TheLangNav: Centerconaier --> rein, maxhöhe - nav wegen scrollin bsp.: BitcoinSpenden
  - On Select --> Close Ja
  - Change Icon Close to be same when MainNav is open
  - Header Breaks: when language is changes reading direction

  // FIL: Component Test
  - Wichtigste Active State: NavBar Button, LangNav Button
  - Header: ToggleButton Hover with underline and text yellow --> NavBarToggleButton
  - LangNav: ButtonHover --> MenuButton with ComponentTest

  // FIL: Integration Test
  - LangNav: change the menu
*/

import { type PropType } from 'vue'

import type { Locales } from '@/modules/langNav/Locales'

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
