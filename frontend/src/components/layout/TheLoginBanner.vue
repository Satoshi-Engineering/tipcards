<template>
  <section
    v-if="isLoggedIn === false"
    class="bg-[#47494f] text-sm text-white"
  >
    <CenterContainer class="!p-2 text-center">
      <I18nT keypath="header.loginBanner.claim">
        <template #login>
          <LinkDefault @click="showModalLogin = true">
            {{ $t('header.loginBanner.login') }}
          </LinkDefault>
        </template>
      </I18nT>
    </CenterContainer>
  </section>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { I18nT } from 'vue-i18n'

import CenterContainer from '@/components/layout/CenterContainer.vue'
import LinkDefault from '@/components/typography/LinkDefault.vue'
import { useAuthStore } from '@/stores/auth'
import { useModalLoginStore } from '@/stores/modalLogin'

const authStore = useAuthStore()
const { isLoggedIn } = storeToRefs(authStore)

const modalLoginStore = useModalLoginStore()
const { showModalLogin } = storeToRefs(modalLoginStore)
</script>
