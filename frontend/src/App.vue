<template>
  <div class="min-h-screen flex flex-col">
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
      <small class="block text-gray-400">
        Switch language:
        <LinkDefault
          :bold="activeLanguage === 'de'"
          @click="() => selectLanguage('de')"
        >DE</LinkDefault>
        |
        <LinkDefault
          :bold="activeLanguage === 'en'"
          @click="() => selectLanguage('en')"
        >EN</LinkDefault>
        |
        <LinkDefault
          :bold="activeLanguage === 'es'"
          @click="() => selectLanguage('es')"
        >ES</LinkDefault>
      </small>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { computed } from 'vue'
import { RouterView } from 'vue-router'
import { useI18n } from 'vue-i18n'

import I18nT from './modules/I18nT'
import LinkDefault from '@/components/typography/LinkDefault.vue'
import ButtonDefault from '@/components/ButtonDefault.vue'
import { useUserStore } from '@/stores/user'
import { SUPPORT_EMAIL } from '@/constants'

const i18n = useI18n()
const { t } = i18n
const activeLanguage = computed(() => i18n.locale.value)
const selectLanguage = (lang: string) => {
  i18n.locale.value = lang
}

const userStore = useUserStore()
const { isLoggedIn } = storeToRefs(userStore)
const { logout } = userStore
</script>
