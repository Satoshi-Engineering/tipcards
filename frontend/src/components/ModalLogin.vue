<template>
  <ModalDefault
    data-test="modal-login"
    @close="$emit('close')"
  >
    <div class="text-center">
      <HeadlineDefault level="h1">
        {{ $t('auth.modalLogin.headline') }}
      </HeadlineDefault>
      <ParagraphDefault v-if="modalLoginUserMessage != null" class="mb-5 p-3 border border-red-500 text-red-500">
        {{ modalLoginUserMessage }}
      </ParagraphDefault>
      <ParagraphDefault v-if="loginFailed" class="mb-4 text-red-500">
        {{ $t('auth.modalLogin.loginErrorText') }}
      </ParagraphDefault>
      <ParagraphDefault v-else-if="!isLoggedIn" class="mb-3">
        {{ $t('auth.modalLogin.text') }}
      </ParagraphDefault>

      <LightningQrCode
        v-if="fetchingLogin || lnurl != null"
        class="my-7"
        :headline="$t('auth.modalLogin.qrCodeHeadline')"
        :value="lnurl || 'lnurl:loadingloadingloading'"
        :loading="fetchingLogin"
        :error="loginFailed ? $t('auth.modalLogin.loginErrorText') : undefined"
        :success="isLoggedIn"
      />
      <ParagraphDefault v-if="isLoggedIn && missingEmail" class="mt-12 text-sm">
        {{ $t('auth.modalLogin.emailHint') }}
        <br>
        <LinkDefault :to="{ name: 'user-account', params: { lang: $route.params.lang } }" @click="$emit('close')">
          {{ $t('auth.modalLogin.emailCta') }}
        </LinkDefault>
      </ParagraphDefault>
      <ParagraphDefault v-if="!isLoggedIn" class="mt-12 mb-4 text-sm">
        {{ $t('auth.modalLogin.cookieWarning') }}
      </ParagraphDefault>
      <ButtonContainer>
        <ButtonDefault
          class="min-w-[170px]"
          variant="secondary"
          data-test="modal-login-close-button"
          @click="$emit('close')"
        >
          {{ !isLoggedIn ? $t('general.cancel') : $t('general.close') }}
        </ButtonDefault>
      </ButtonContainer>
    </div>
  </ModalDefault>
</template>

<script lang="ts" setup>
import { storeToRefs } from 'pinia'
import { io, Socket } from 'socket.io-client'
import { onBeforeMount, onBeforeUnmount, ref } from 'vue'

import { useProfileStore } from '@/stores/profile'
import useTRpcAuth from '@/modules/useTRpcAuth'
import ModalDefault from '@/components/ModalDefault.vue'
import LightningQrCode from '@/components/LightningQrCode.vue'
import ButtonDefault from '@/components/buttons/ButtonDefault.vue'
import LinkDefault from '@/components/typography/LinkDefault.vue'
import ParagraphDefault from '@/components/typography/ParagraphDefault.vue'
import { useAuthStore } from '@/stores/auth'
import { useModalLoginStore } from '@/stores/modalLogin'
import { TIPCARDS_AUTH_ORIGIN } from '@/constants'
import HeadlineDefault from './typography/HeadlineDefault.vue'
import ButtonContainer from './buttons/ButtonContainer.vue'

defineEmits(['close'])

const authStore = useAuthStore()
const { login } = authStore
const { isLoggedIn } = storeToRefs(authStore)

const profileStore = useProfileStore()
const { subscribe } = profileStore
const { userEmail } = storeToRefs(profileStore)

const modalLoginStore = useModalLoginStore()
const { modalLoginUserMessage } = storeToRefs(modalLoginStore)

const fetchingLogin = ref(true)
const lnurl = ref<string>()
const hash = ref<string>()
const loginFailed = ref(false)
const missingEmail = ref(false)
let socket: Socket

onBeforeMount(async () => {
  try {
    const trpcAuth = useTRpcAuth()
    const response = await trpcAuth.lnurlAuth.create.query()
    lnurl.value = response.lnurlAuth
    hash.value = response.hash
  } catch(error) {
    console.error(error)
  }
  connectSocket()
  fetchingLogin.value = false
  loginFailed.value = false
})
const connectSocket = () => {
  socket = io(TIPCARDS_AUTH_ORIGIN)
  socket.on('error', () => {
    loginFailed.value = true
  })
  socket.on('loggedIn', async () => {
    if (hash.value == null) {
      return
    }

    try {
      await login(hash.value)
    } catch (error) {
      loginFailed.value = true
      console.error(error)
    }
    modalLoginUserMessage.value = null

    try {
      await subscribe()
      if (typeof userEmail.value != 'string' || userEmail.value.length < 1) {
        missingEmail.value = true
      }
    } catch (error) {
      console.error(error)
    }
  })
  socket.on('connect', () => {
    socket.emit('waitForLogin', { hash: hash.value })
  })
}
onBeforeUnmount(() => {
  hash.value = undefined
  lnurl.value = undefined
  if (socket != null) {
    socket.close()
  }
})

/////
// reconnect on tab change (connection gets lost on smartphones sometimes)
const reconnectOnVisibilityChange = () => {
  if (document.visibilityState !== 'visible' || socket == null || hash.value == null) {
    return
  }
  socket.close()
  connectSocket()
}
onBeforeMount(() => {
  document.addEventListener('visibilitychange', reconnectOnVisibilityChange)
})
onBeforeUnmount(() => {
  document.removeEventListener('visibilitychange', reconnectOnVisibilityChange)
})
</script>
