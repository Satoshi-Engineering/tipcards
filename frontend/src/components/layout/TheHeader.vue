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
      <button
        v-if="activeMenu === 'none'"
        class="hover:text-yellow w-6 h-6 "
        @click="activeMenu = 'language'"
      >
        <IconWorld />
      </button>
      <button
        v-if="activeMenu === 'none'"
        class="hover:text-yellow"
        @click="activeMenu = 'language'"
      >
        <TheMainNav class="ml-2" />
      </button>
      <button
        v-if="activeMenu !== 'none'"
        class="hover:text-yellow w-6 h-6 "
        @click="activeMenu = 'none'"
      >
        <IconClose />
      </button>
    </CenterContainer>
    <CenterContainer>
      <TheLangNav
        v-if="activeMenu === 'language'"
        :locales="locales"
        :current-locale="currentLocale"
      />
    </CenterContainer>
  </header>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { ref, type PropType } from 'vue'

import CenterContainer from '@/components/layout/CenterContainer.vue'
import TheLangNav from '@/components/layout/TheLangNav.vue'
import TheMainNav from '@/components/layout/TheMainNav.vue'
import IconWorld from '@/components/svgs/IconWorld.vue'
import IconClose from '@/components/svgs/IconClose.vue'
import IconLogo from '@/components/svgs/IconLogo.vue'
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

const activeMenu = ref<'none'|'language'|'main'>('none')

</script>
