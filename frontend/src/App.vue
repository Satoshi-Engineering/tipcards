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
    <footer class="mx-auto mt-auto pt-20 px-4 pb-2 w-full max-w-md print:hidden">
      <small
        v-if="SUPPORT_EMAIL != null"
        class="block text-gray-400"
      >
        <I18nT keypath="footer.support">
          <template #email>
            <LinkDefault :href="`mailto:${SUPPORT_EMAIL}?subject=Lightning%20Tip%20Cards%20Feedback`">{{ SUPPORT_EMAIL }}</LinkDefault>
          </template>
        </I18nT>
      </small>
      <small class="block text-gray-400" dir="ltr">
        Switch language:
        <br>
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
      </small>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { nextTick } from 'vue'
import { RouterView, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'

import { LOCALES, setLocale, useI18nHelpers, type LocaleCode } from '@/modules/initI18n'
import I18nT from '@/modules/I18nT'
import LinkDefault from '@/components/typography/LinkDefault.vue'
import ButtonDefault from '@/components/ButtonDefault.vue'
import { useUserStore } from '@/stores/user'
import { SUPPORT_EMAIL } from '@/constants'
import { useSeoHelpers } from '@/modules/seoHelpers'

const router = useRouter()
const { setDocumentTitle, setHeaderSeo } = useSeoHelpers()

router.afterEach(async () => {
  await nextTick()
  setHeaderSeo()
  setDocumentTitle()
})

const { t } = useI18n()
const { currentLocale, currentTextDirection } = useI18nHelpers()
const selectLocale = async (code: LocaleCode) => {
  await setLocale(code)
  setHeaderSeo()
  setDocumentTitle()
}

const userStore = useUserStore()
const { isLoggedIn } = storeToRefs(userStore)
const { logout } = userStore
</script>
