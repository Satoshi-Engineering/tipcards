<template>
  <div class="min-h-screen flex flex-col" :dir="currentTextDirection">
    <header
      class="grid grid-cols-2 max-w-md w-full m-auto mt-0 mb-0 print:hidden"
    >
      <BackLink
        v-if="backlink != null"
        class="p-4"
        :to="backlink.to"
        :only-internal-referrer="backlink.onlyInternalReferrer"
      />
      <div v-if="isLoggedIn === true" class="col-start-2 p-4 text-right">
        <LinkDefault :to="{ name: 'user-account' }">
          {{ t('general.userAccount') }}
        </LinkDefault>
      </div>
      <div v-else-if="isLoggedIn === false" class="col-start-2 p-4 text-right">
        <LinkDefault @click="showModalLogin = true">
          {{ t('general.login') }}
        </LinkDefault>
      </div>
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
  <ModalResolveLocalStorage v-if="showResolveLocalStorage" />
  <ModalLogin
    v-if="showModalLogin"
    @close="showModalLogin = false"
  />
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { computed, nextTick, watchEffect } from 'vue'
import { RouterView, useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'

import LinkDefault from '@/components/typography/LinkDefault.vue'
import BackLink from '@/components/BackLink.vue'
import ModalResolveLocalStorage from '@/components/ModalResolveLocalStorage.vue'
import ModalLogin from '@/components/ModalLogin.vue'
import { LOCALES, setLocale, useI18nHelpers, type LocaleCode } from '@/modules/initI18n'
import I18nT from '@/modules/I18nT'
import { useSeoHelpers } from '@/modules/seoHelpers'
import { useAuthStore } from '@/stores/auth'
import { useCardsSetsStore } from '@/stores/cardsSets'
import { useModalLoginStore } from '@/stores/modalLogin'
import { SUPPORT_EMAIL } from '@/constants'

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

const backlink = computed(() => {
  if (route.meta.backlink === true) {
    return {
      to: undefined,
      onlyInternalReferrer: !!route.meta.backlinkOnlyInternalReferrer,
    }
  }
  if (typeof route.meta.backlink === 'string') {
    return {
      to: { name: route.meta.backlink },
      onlyInternalReferrer: !!route.meta.backlinkOnlyInternalReferrer,
    }
  }
  if (typeof route.meta.backlink === 'function') {
    return {
      to: route.meta.backlink(route),
      onlyInternalReferrer: !!route.meta.backlinkOnlyInternalReferrer,
    }
  }
  return null
})

const authStore = useAuthStore()
const { isLoggedIn } = storeToRefs(authStore)

const cardsSetsStore = useCardsSetsStore()
const { hasSetsInLocalStorage } = storeToRefs(cardsSetsStore)
const showResolveLocalStorage = computed(() => isLoggedIn.value && hasSetsInLocalStorage.value)

const modalLoginStore = useModalLoginStore()
const { showModalLogin } = storeToRefs(modalLoginStore)

watchEffect(() => {
  if (showResolveLocalStorage.value) {
    showModalLogin.value = false
  }
})
</script>
