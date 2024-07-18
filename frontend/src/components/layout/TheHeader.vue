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
    <TheLangNav class="mr-5" />
    <TheMainNav />
  </header>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'

import TheLangNav from './TheLangNav.vue'
import TheMainNav from './TheMainNav.vue'

import IconLogo from '@/components/svgs/IconLogo.vue'
</script>
