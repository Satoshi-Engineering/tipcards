<template>
  <nav class="w-full bg-white animate-fade-in" data-test="the-lang-nav">
    <CenterContainer class="h-[calc(100dvh-56px)] overflow-y-auto py-6">
      <ul>
        <li
          v-for="locale in locales"
          :key="locale.code"
          class="border-t border-white-50 first:border-t-0"
        >
          <RouterLink
            :to="{ ...$route, params: { ...$route.params, lang: locale.code } }"
            :hreflang="locale.code"
            rel="alternate"
            class="block py-3 pl-4 text-lg hover:underline"
            :class="{
              'font-bold text-yellow hover:no-underline': locale.code === currentLocale,
            }"
            :data-test="`the-lang-nav-item-${locale.code}`"
            @click="() => emit('itemSelected')"
          >
            {{ locale.name }}
          </RouterLink>
        </li>
      </ul>
    </CenterContainer>
  </nav>
</template>

<script setup lang="ts">
import { ref } from 'vue'

import CenterContainer from '@/components/layout/CenterContainer.vue'
import { useI18nHelpers } from '@/modules/initI18n'
import LOCALES from '@shared/modules/i18n/locales'

const { currentLocale } = useI18nHelpers()
const locales = ref(Object.entries(LOCALES).map(([code, { name }]) => ({ code, name })))

const emit = defineEmits(['itemSelected'])
</script>
