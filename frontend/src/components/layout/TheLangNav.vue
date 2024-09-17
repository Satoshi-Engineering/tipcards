<template>
  <nav
    id="the-lang-nav"
    class="w-full bg-white animate-fade-in"
    data-test="the-lang-nav"
  >
    <CenterContainer class="h-[calc(100dvh-56px)] overflow-y-auto py-6">
      <ul>
        <li
          v-for="locale in locales"
          :key="locale.code"
          class="border-t border-white-50 first:border-t-0"
        >
          <RouterLink
            :to="locale.route"
            :hreflang="locale.code"
            rel="alternate"
            class="block py-3 pl-4 text-lg hover:underline"
            :class="{
              'font-bold text-yellow hover:no-underline': locale.code === currentLocale,
            }"
            :data-test="`the-lang-nav-item-${locale.code}`"
            @click="() => emit('itemSelected')"
          >
            {{ locale.label }}
          </RouterLink>
        </li>
      </ul>
    </CenterContainer>
  </nav>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink, useRoute, type RouteLocationRaw } from 'vue-router'

import CenterContainer from '@/components/layout/CenterContainer.vue'
import { useI18nHelpers } from '@/modules/initI18n'
import LOCALES, { LOCALE_CODES, type LocaleCode } from '@shared/modules/i18n/locales'

const route = useRoute()
const { currentLocale } = useI18nHelpers()

const locales = ref<{
  code: LocaleCode,
  label: string,
  route: RouteLocationRaw,
}[]>(LOCALE_CODES.map((code) => {
  return {
    code,
    label: LOCALES[code].name,
    route: {
      ...route,
      params: {
        ...route.params,
        lang: code,
      },
    },
  }
}))

const emit = defineEmits(['itemSelected'])
</script>
