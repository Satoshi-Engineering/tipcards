<template>
  <div class="min-h-screen flex flex-col" :dir="currentTextDirection">
    <header
      v-if="isLoggedIn"
      class="p-4 text-right"
    >
      <ButtonDefault
        class="m-0"
        variant="outline"
        @click="logout"
      >
        {{ t('auth.logout') }}
      </ButtonDefault>
    </header>
    <RouterView />
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
              :to="{ name: routeName, params: { lang: route.params.lang } }"
              :bold="false"
              active-class="font-bold"
            >
              {{ t(labelKey) }}
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
              :bold="currentLocale === code"
              @click="() => selectLocale(code as LocaleCode)"
            >{{ name }}</LinkDefault>
            <span class="group-last:hidden"> | </span>
          </span>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { nextTick } from 'vue'
import { RouterView, useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'

import { LOCALES, setLocale, useI18nHelpers, type LocaleCode } from '@/modules/initI18n'
import I18nT from '@/modules/I18nT'
import LinkDefault from '@/components/typography/LinkDefault.vue'
import ButtonDefault from '@/components/ButtonDefault.vue'
import { useUserStore } from '@/stores/user'
import { SUPPORT_EMAIL } from '@/constants'
import { useSeoHelpers } from '@/modules/seoHelpers'

const router = useRouter()
const route = useRoute()
const { setDocumentTitle, setHeaderSeo } = useSeoHelpers()

router.afterEach(async () => {
  if (route?.params.lang != null && route?.params.lang !== '') {
    setLocale(route.params.lang as LocaleCode)
  }
  await nextTick()
  setHeaderSeo()
  setDocumentTitle()
})

const { t } = useI18n()
const { currentLocale, currentTextDirection } = useI18nHelpers()
const selectLocale = async (code: LocaleCode) => {
  router.push({
    ...route,
    params: {
      ...route.params,
      lang: code,
    },
  })
}

const navLinks = [
  { routeName: 'home', labelKey: 'nav.index' },
  { routeName: 'cards', labelKey: 'nav.cards' },
  { routeName: 'preview', labelKey: 'nav.preview' },
  { routeName: 'about', labelKey: 'nav.about' },
]

const userStore = useUserStore()
const { isLoggedIn } = storeToRefs(userStore)
const { logout } = userStore
</script>
