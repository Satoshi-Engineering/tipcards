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
        class="me-auto flex flex-row items-center"
      >
        <IconLogo />
      </RouterLink>
      <button
        v-if="activeMenu === 'none'"
        class="hover:text-yellow w-6 h-6 "
        data-test="the-header-lang-button"
        @click="activeMenu = 'language'"
      >
        <IconWorld />
      </button>
      <button
        v-if="activeMenu === 'none'"
        class="hover:text-yellow"
        @click="activeMenu = 'main'"
      >
        <TheMainNav class="ms-2" />
      </button>
      <button
        v-if="activeMenu !== 'none'"
        class="hover:text-yellow w-6 h-6 "
        data-test="the-header-close-button"
        @click="activeMenu = 'none'"
      >
        <IconClose />
      </button>
    </CenterContainer>
    <TheLangNav
      v-if="activeMenu === 'language'"
      :locales="locales"
      :current-locale="currentLocale"
      class="absolute top-full"
      @item-selected="onMenuItemSelected"
    />
  </header>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { ref, watch, type PropType } from 'vue'

import CenterContainer from '@/components/layout/CenterContainer.vue'
import TheLangNav from '@/components/layout/TheLangNav.vue'
import TheMainNav from '@/components/layout/TheMainNav.vue'
import IconWorld from '@/components/svgs/IconWorld.vue'
import IconClose from '@/components/svgs/IconClose.vue'
import IconLogo from '@/components/svgs/IconLogo.vue'
import type { Locales } from '@/modules/langNav/Locales'
import { usePageScroll } from '@/modules/usePageScroll'

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
const onMenuItemSelected = () => {
  activeMenu.value = 'none'
}

const { disablePageScroll, enablePageScroll } = usePageScroll()

watch(activeMenu, (value) => {
  // Bad voodoo magic signed off by Dave - DRAFT
  if (value === 'none') {
    enablePageScroll()
  } else {
    disablePageScroll()
  }
})

</script>
