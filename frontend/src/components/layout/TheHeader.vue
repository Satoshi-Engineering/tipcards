<template>
  <header
    class="
      sticky top-0 z-30
      mb-2
      flex flex-col
      bg-white
    "
  >
    <section class="relative order-1 xs:order-2">
      <CenterContainer class="flex items-center gap-4">
        <RouterLink
          :to="{ name: 'home', params: { lang: $route.params.lang } }"
          :title="$t('nav.index')"
          data-test="the-header-home-button"
          class="me-auto flex flex-row items-center"
        >
          <IconLogo class="h-10 w-auto" />
        </RouterLink>
        <button
          v-if="activeMenu === 'none'"
          class="hover:text-yellow w-6 h-6"
          data-test="the-header-lang-button"
          :title="$t('header.langNavLabel')"
          @click="activeMenu = 'language'"
        >
          <IconWorld />
        </button>
        <button
          v-if="activeMenu === 'none'"
          class="hover:text-yellow w-8 h-6"
          data-test="the-header-main-nav-button"
          :title="$t('header.mainNavLabel')"
          @click="activeMenu = 'main-nav'"
        >
          <IconMainNav />
        </button>
        <button
          v-if="activeMenu !== 'none'"
          class="hover:text-yellow w-18 h-6 ps-12"
          data-test="the-header-close-button"
          :title="$t('general.close')"
          @click="closeAllMenus"
        >
          <IconX />
        </button>
      </CenterContainer>
      <TheLangNav
        v-if="activeMenu === 'language'"
        class="absolute top-full"
        @item-selected="closeAllMenus"
      />
      <TheMainNav
        v-if="activeMenu === 'main-nav'"
        class="absolute top-full"
        @item-selected="closeAllMenus"
      />
    </section>
    <TheLoginBanner
      v-if="loginBanner"
      class="order-2 xs:order-1"
      @login-clicked="closeAllMenus"
    />
  </header>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { ref } from 'vue'

import CenterContainer from '@/components/layout/CenterContainer.vue'
import TheLangNav from '@/components/layout/TheLangNav.vue'
import TheMainNav from '@/components/layout/theMainNav/TheMainNav.vue'
import TheLoginBanner from '@/components/layout/TheLoginBanner.vue'
import IconWorld from '@/components/icons/IconWorld.vue'
import IconX from '@/components/icons/IconX.vue'
import IconMainNav from '@/components/icons/IconMainNav.vue'
import IconLogo from '@/components/icons/IconLogo.vue'

defineProps({
  loginBanner: {
    type: Boolean,
    default: false,
  },
})

const activeMenu = ref<'none'|'language'|'main-nav'>('none')

const closeAllMenus = () => {
  activeMenu.value = 'none'
}
</script>
