<template>
  <footer class="mx-auto mt-auto pt-20 px-4 pb-2 w-full max-w-md text-xs text-grey print:hidden">
    <div
      v-if="SUPPORT_EMAIL != null"
      class="my-4"
    >
      <I18nT keypath="footer.support">
        <template #email>
          <LinkDefault :href="`mailto:${SUPPORT_EMAIL}?subject=Lightning%20Tip%20Cards%20Feedback`">{{ SUPPORT_EMAIL }}</LinkDefault>
        </template>
      </I18nT>
    </div>
    <nav class="my-4">
      <ul class="flex text-xs text-grey-dark gap-x-2">
        <li
          v-for="{ routeName, labelKey }, index of navLinks"
          :key="index"
        >
          <LinkDefault
            :to="{ name: routeName, params: { lang: $route.params.lang } }"
            :bold="false"
            active-class="font-bold"
          >
            {{ $t(labelKey) }}
          </LinkDefault>
        </li>
      </ul>
    </nav>
    <div class="mt-4 flex flex-wrap gap-x-1" dir="ltr">
      <div>Switch language:</div>
      <div>
        <span
          v-for="([code, { name }]) of Object.entries(LOCALES)"
          :key="code"
          class="group"
        >
          <LinkDefault
            :to="{ ...$route, params: { ...$route.params, lang: code } }"
            :bold="currentLocale === code"
            :hreflang="code"
            rel="alternate"
          >{{ name }}</LinkDefault>
          <span class="group-last:hidden"> | </span>
        </span>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import LinkDefault from '@/components/typography/LinkDefault.vue'
import { useI18nHelpers } from '@/modules/initI18n'
import LOCALES from '@shared/modules/i18n/locales'
import { SUPPORT_EMAIL } from '@/constants'

const { currentLocale } = useI18nHelpers()

const navLinks = [
  { routeName: 'home', labelKey: 'nav.index' },
  { routeName: 'cards', labelKey: 'nav.cards' },
  { routeName: 'landing', labelKey: 'nav.landing' },
  { routeName: 'about', labelKey: 'nav.about' },
]
</script>
