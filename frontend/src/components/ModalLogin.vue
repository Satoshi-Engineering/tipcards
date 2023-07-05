<template>
  <ModalDefault :headline="$t('auth.modalLogin.headline')" @close="$emit('close')">
    <p v-if="!error" class="mb-3">
      {{ $t('auth.modalLogin.text') }}
    </p>
    <p v-else class="mb-4 text-red-500">
      {{ $t('auth.modalLogin.loginErrorText') }}
    </p>
    <p class="mb-4">
      {{ $t('auth.modalLogin.cookieWarning') }}
    </p>
    <AnimatedLoadingWheel v-if="fetchingLogin" />
    <LightningQrCode
      v-else-if="lnurl != null"
      :value="lnurl"
      :error="error ? $t('auth.modalLogin.loginErrorText') : undefined"
      :success="isLoggedIn"
    />
    <p v-if="isLoggedIn && missingEmail" class="mt-12 text-sm">
      {{ $t('auth.modalLogin.emailHint') }}
      <br>
      <LinkDefault :to="{ name: 'user-account' }">
        {{ $t('auth.modalLogin.emailCta') }}
      </LinkDefault>
    </p>
    <div class="mt-12 text-center">
      <ButtonDefault
        class="text-sm min-w-[170px]"
        :variant="isLoggedIn ? undefined : 'outline'"
        @click="$emit('close')"
      >
        {{ $t('auth.modalLogin.close') }}
      </ButtonDefault>
    </div>
  </ModalDefault>
</template>

<script lang="ts" setup>
import axios from 'axios'
import { storeToRefs } from 'pinia'
import { io, Socket } from 'socket.io-client'
import { onBeforeMount, onBeforeUnmount, ref } from 'vue'

import ModalDefault from '@/components/ModalDefault.vue'
import AnimatedLoadingWheel from '@/components/AnimatedLoadingWheel.vue'
import LightningQrCode from '@/components/LightningQrCode.vue'
import ButtonDefault from '@/components/ButtonDefault.vue'
import LinkDefault from '@/components/typography/LinkDefault.vue'
import { useUserStore } from '@/stores/user'
import { BACKEND_API_ORIGIN } from '@/constants'

defineEmits(['close'])
const userStore = useUserStore()
const { login } = userStore
const { isLoggedIn } = storeToRefs(userStore)

const fetchingLogin = ref(true)
const lnurl = ref<string>()
const hash = ref<string>()
const error = ref(false)
const missingEmail = ref(false)
let socket: Socket

onBeforeMount(async () => {
  try {
    const response = await axios.get(`${BACKEND_API_ORIGIN}/api/auth/create`)
    if (response.data.status === 'success') {
      lnurl.value = response.data.data.encoded
      hash.value = response.data.data.hash
    }
  } catch(error) {
    console.error(error)
  }
  connectSocket()
  fetchingLogin.value = false
  error.value = false
})
const connectSocket = () => {
  socket = io(BACKEND_API_ORIGIN)
  socket.on('error', () => {
    error.value = true
  })
  socket.on('loggedIn', async () => {
    if (hash.value == null) {
      return
    }
    await login(hash.value)
    try {
      const { data } = await axios.get(`${BACKEND_API_ORIGIN}/api/auth/profile`)
      if (typeof data.data?.email !== 'string' || data.data.email.length === 0) {
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
