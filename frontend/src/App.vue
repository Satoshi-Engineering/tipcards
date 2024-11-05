<template>
  <RouterView />
  <ModalLogin
    v-if="showModalLogin"
    @close="showModalLogin = false"
  />
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { nextTick, onBeforeMount } from 'vue'
import { RouterView, useRouter, useRoute } from 'vue-router'

import ModalLogin from '@/components/ModalLogin.vue'
import initApiAuthInterceptors from '@/modules/initApiAuthInterceptors'
import { setLocale } from '@/modules/initI18n'
import { useSeoHelpers } from '@/modules/seoHelpers'
import useAuth from '@/modules/useAuth'
import { useModalLoginStore } from '@/stores/modalLogin'

onBeforeMount(() => {
  const { initAuth } = useAuth()
  initAuth()
  initApiAuthInterceptors()
})

const router = useRouter()
const route = useRoute()
const { setDocumentTitle, initHtmlSeoWatchers } = useSeoHelpers()

initHtmlSeoWatchers()

router.afterEach(async () => {
  if (route.params.lang != null && route.params.lang !== '') {
    await setLocale(route.params.lang)
  }
  await nextTick()
  setDocumentTitle()
})

const modalLoginStore = useModalLoginStore()
const { showModalLogin } = storeToRefs(modalLoginStore)
</script>
