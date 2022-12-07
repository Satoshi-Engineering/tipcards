<template>
  <div class="min-h-screen flex flex-col">
    <RouterView />
    <footer class="mx-auto mt-auto pt-20 px-4 pb-2 w-full max-w-md print:hidden">
      <small
        v-if="SUPPORT_EMAIL != null"
        class="block text-gray-400"
      >
        <Translation keypath="footer.support">
          <template #email>
            <LinkDefault :href="`mailto:${SUPPORT_EMAIL}?subject=Lightning%20Tip%20Cards%20Feedback`">{{ SUPPORT_EMAIL }}</LinkDefault>
          </template>
        </Translation>
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
import { computed } from 'vue'
import { RouterView } from 'vue-router'
import { Translation, useI18n } from 'vue-i18n'

import LinkDefault from '@/components/typography/LinkDefault.vue'
import { SUPPORT_EMAIL } from '@/constants'

const i18n = useI18n()
const activeLanguage = computed(() => i18n.locale.value)
const selectLanguage = (lang: string) => {
  i18n.locale.value = lang
}
</script>
