<template>
  <RouterView />
  <ModalLogin
    v-if="showModalLogin"
    @close="showModalLogin = false"
  />
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import {  nextTick, watch } from 'vue'
import { RouterView, useRouter, useRoute } from 'vue-router'

import ModalLogin from '@/components/ModalLogin.vue'
import { setLocale } from '@/modules/initI18n'
import { useSeoHelpers } from '@/modules/seoHelpers'
import { useModalLoginStore } from '@/stores/modalLogin'
import { usePageScroll } from './modules/usePageScroll'

const router = useRouter()
const route = useRoute()
const { setDocumentTitle, initHtmlSeoWatchers } = useSeoHelpers()

initHtmlSeoWatchers()

router.afterEach(async () => {
  if (route.params.lang != null && route.params.lang !== '') {
    setLocale(route.params.lang)
  }
  await nextTick()
  setDocumentTitle()
})

const modalLoginStore = useModalLoginStore()
const { showModalLogin } = storeToRefs(modalLoginStore)

const { disablePageScroll, enablePageScroll } = usePageScroll()
watch(showModalLogin, (value) => {
  // Bad voodoo magic signed off by Dave - DRAFT
  if (value) {
    disablePageScroll()
  } else {
    enablePageScroll()
  }
})
</script>
