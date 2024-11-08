<template>
  <section
    v-if="isLoggedIn === false"
    class="bg-[#47494f] text-sm text-white"
    data-test="the-login-banner"
  >
    <CenterContainer class="!p-2 text-center">
      <I18nT
        keypath="header.loginBanner.claim"
        :scope="i18nScope"
      >
        <template #login>
          <LinkDefault
            data-test="login-banner-login"
            @click="() => {
              showModalLogin = true
              $emit('loginClicked')
            }"
          >
            {{ $t('header.loginBanner.login') }}
          </LinkDefault>
        </template>
      </I18nT>
    </CenterContainer>
  </section>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { I18nT, type ComponentI18nScope } from 'vue-i18n'

import CenterContainer from '@/components/layout/CenterContainer.vue'
import LinkDefault from '@/components/typography/LinkDefault.vue'
import { useAuthStore } from '@/stores/auth'
import { useModalLoginStore } from '@/stores/modalLogin'
import type { PropType } from 'vue'

defineProps({
  i18nScope: {
    type: String as PropType<ComponentI18nScope>,
    default: 'parent',
  },
})

defineEmits(['loginClicked'])

const authStore = useAuthStore()
const { isLoggedIn } = storeToRefs(authStore)

const modalLoginStore = useModalLoginStore()
const { showModalLogin } = storeToRefs(modalLoginStore)
</script>
