<template>
  <header
    class="
      sticky top-0 z-10
      mb-2
      bg-white
    "
  >
    <CenterContainer class="flex items-center">
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
    </CenterContainer>
  </header>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
import type { PropType } from 'vue'

import CenterContainer from '@/components/layout/CenterContainer.vue'
import TheLangNav from '@/components/layout/TheLangNav.vue'
import TheMainNav from '@/components/layout/TheMainNav.vue'
import IconWorld from '@/components/svgs/IconWorld.vue'
import IconLogo from '@/components/svgs/IconLogo.vue'
import type { Locales } from '@/modules/langNav/Locales'

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
