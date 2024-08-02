<template>
  <header class="grid grid-cols-2 max-w-md w-full m-auto mt-0 mb-0 print:hidden">
    <BackLinkDeprecated class="p-4" />
    <div v-if="isLoggedIn === true" class="col-start-2 p-4 text-end">
      <LinkDefault :to="{ name: 'user-account', params: { lang: $route.params.lang } }">
        {{ $t('general.userAccount') }}
      </LinkDefault>
    </div>
    <div v-else-if="isLoggedIn === false" class="col-start-2 p-4 text-end">
      <LinkDefault @click="showModalLogin = true">
        {{ $t('general.login') }}
      </LinkDefault>
    </div>
  </header>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'

import LinkDefault from '@/components/typography/LinkDefault.vue'
import BackLinkDeprecated from '@/components/BackLinkDeprecated.vue'
import { useAuthStore } from '@/stores/auth'
import { useModalLoginStore } from '@/stores/modalLogin'

const authStore = useAuthStore()
const { isLoggedIn } = storeToRefs(authStore)

const modalLoginStore = useModalLoginStore()
const { showModalLogin } = storeToRefs(modalLoginStore)
</script>
