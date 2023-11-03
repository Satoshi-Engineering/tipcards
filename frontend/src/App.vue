<template>
  <RouterView />
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

import ModalResolveLocalStorage from '@/components/ModalResolveLocalStorage.vue'
import ModalLogin from '@/components/ModalLogin.vue'
import { setLocale, type LocaleCode } from '@/modules/initI18n'
import { useSeoHelpers } from '@/modules/seoHelpers'
import { useAuthStore } from '@/stores/auth'
import { useCardsSetsStore } from '@/stores/cardsSets'
import { useModalLoginStore } from '@/stores/modalLogin'

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
