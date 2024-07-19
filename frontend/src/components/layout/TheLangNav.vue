<template>
  <ul class="pt-1">
    <li
      v-for="(locale, index) in locales"
      :key="locale.code"
      :class="{ 'font-bold text-yellow': locale.code === currentLocale, 'border-t border-menu-sperator' : index !== 0 }"
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
/* FIL: - Questions
  - Funktionsweise --> von Icon & Nav
    - On Select --> Close?
  - Header: World & X Icon --> ToggleButton --> ButtonDefault with variant "ToggleIconButton" erweitern?
  - TheLangNav --> TheLangMenu
  - TheLangNav --> MenuButtonDefault: active yellow und hover:underline
  - Color:         'menu-sperator': '#8a8b8b', // menu seperator (lang nav) oder white-50?

  // FIL:

  // FIL: Component Test
  - Hover with underline and text yellow
  - TheHeader.test: TheLangNav: show hide
  - TheHeader.test: add Lang Toggle Icons

  // FIL: Integration Test
  - Open Close the Lang nav with icon change
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
