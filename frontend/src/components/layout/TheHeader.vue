<template>
  <header
    class="
      sticky top-0 z-10
      mb-2
      bg-white
    "
  >
    <CenterContainer class="flex items-center gap-4">
      <RouterLink
        :to="{ name: 'home', params: { lang: $route.params.lang } }"
        data-test="the-header-home-button"
        class="me-auto flex flex-row items-center"
      >
        <IconLogo />
      </RouterLink>
      <button
        v-if="activeMenu === 'none'"
        class="hover:text-yellow w-6 h-6"
        data-test="the-header-lang-button"
        :aria-label="$t('language')"
        @click="activeMenu = 'language'"
      >
        <IconWorld />
      </button>
      <button
        v-if="activeMenu === 'none'"
        class="hover:text-yellow w-8 h-6"
        :aria-label="$t('mainNav')"
        @click="activeMenu = 'main-nav'"
      >
        <IconMainNav />
      </button>
      <button
        v-if="activeMenu !== 'none'"
        class="hover:text-yellow w-18 h-6 ps-12"
        data-test="the-header-close-button"
        :aria-label="$t('close')"
        @click="activeMenu = 'none'"
      >
        <IconClose />
      </button>
    </CenterContainer>
    <TheLangNav
      v-if="activeMenu === 'language'"
      class="absolute top-full"
      @item-selected="onMenuItemSelected"
    />
    <TheMainNav
      v-if="activeMenu === 'main-nav'"
      class="absolute top-full"
      @item-selected="onMenuItemSelected"
    />
  </header>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { ref, watch } from 'vue'

import CenterContainer from '@/components/layout/CenterContainer.vue'
import TheLangNav from '@/components/layout/TheLangNav.vue'
import TheMainNav from '@/components/layout/TheMainNav.vue'
import IconWorld from '@/components/icons/IconWorld.vue'
import IconClose from '@/components/icons/IconClose.vue'
import IconMainNav from '@/components/icons/IconMainNav.vue'
import IconLogo from '@/components/icons/IconLogo.vue'
import { usePageScroll } from '@/modules/usePageScroll'

const activeMenu = ref<'none'|'language'|'main-nav'>('none')
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
