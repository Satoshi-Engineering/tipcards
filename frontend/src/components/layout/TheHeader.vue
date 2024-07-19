<template>
  <header
    class="
      sticky top-0 z-10
      flex justify-start items-center
      mb-2 px-5 py-3
      bg-white
    "
  >
    <RouterLink
      :to="{ name: 'home', params: { lang: $route.params.lang } }"
      class="mr-auto flex flex-row items-center"
    >
      <IconLogo />
    </RouterLink>
    <div class="w-6 h-6">
      <IconWorld />
    </div>
    <TheMainNav />
    <TheLangNav
      class="hidden"
      :locales="locales"
      :current-code="currentCode"
    />
  </header>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
import type { PropType } from 'vue'

import type { Locales } from '@/modules/langNav/Locales'
import IconWorld from '@/components/svgs/IconWorld.vue'

import TheLangNav from './TheLangNav.vue'
import TheMainNav from './TheMainNav.vue'

import IconLogo from '@/components/svgs/IconLogo.vue'

defineProps({
  locales: {
    type: Array as PropType<Locales>,
    default: () => [],
  },
  currentCode: {
    type: String,
    default: '',
  },
})

</script>
