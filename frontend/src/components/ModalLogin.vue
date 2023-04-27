<template>
  <div
    class="flex justify-center items-center fixed top-0 left-0 right-0 w-full h-full p-4 overflow-x-hidden overflow-y-auto bg-grey bg-opacity-50"
    @click="$emit('close')"
  >
    <div
      class="relative w-full h-full max-w-2xl md:h-auto"
      @click.stop
    >
      <!-- Modal content -->
      <div class="relative bg-white rounded-lg shadow p-4">
        <div class="flex items-start justify-between mb-4">
          <HeadlineDefault level="h3">
            {{ t('auth.modalLogin.headline') }}
          </HeadlineDefault>
          <button
            type="button"
            class="text-grey bg-transparent hover:bg-grey-light hover:text-grey-dark rounded-lg text-sm p-1.5 ml-auto inline-flex items-center"
            @click="$emit('close')"
          >
            <svg
              class="w-5 h-5"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fill-rule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clip-rule="evenodd"
              />
            </svg>
          </button>
        </div>
        <p v-if="!error" class="mb-3">
          {{ t('auth.modalLogin.text') }}
        </p>
        <p v-else class="mb-4 text-red-500">
          {{ t('auth.modalLogin.loginErrorText') }}
        </p>
        <p class="mb-4">
          {{ t('auth.modalLogin.cookieWarning') }}
        </p>
        <AnimatedLoadingWheel v-if="fetchingLogin" />
        <LightningQrCode
          v-else-if="lnurl != null"
          :value="lnurl"
          :error="error ? t('auth.modalLogin.loginErrorText') : undefined"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import axios from 'axios'
import { io, Socket } from 'socket.io-client'
import { onBeforeMount, onBeforeUnmount, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import HeadlineDefault from '@/components/typography/HeadlineDefault.vue'
import AnimatedLoadingWheel from '@/components/AnimatedLoadingWheel.vue'
import LightningQrCode from '@/components/LightningQrCode.vue'
import { useUserStore } from '@/stores/user'
import { BACKEND_API_ORIGIN } from '@/constants'

const { t } = useI18n()
const emit = defineEmits(['close'])
const { login } = useUserStore()

const fetchingLogin = ref(true)
const lnurl = ref<string>()
const hash = ref<string>()
const error = ref(false)
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
  socket.on('loggedIn', ({ jwt }) => {
    login({ jwt })
    emit('close')
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

/////
// close on escape
const onKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    emit('close')
  }
}
onBeforeMount(() => {
  document.addEventListener('keydown', onKeyDown)
})
onBeforeUnmount(() => {
  document.removeEventListener('keydown', onKeyDown)
})
</script>
