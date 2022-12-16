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
            {{ t('auth.login') }}
          </HeadlineDefault>
          <button
            type="button"
            class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center"
            @click="$emit('close')"
          >
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>
          </button>
        </div>
        <p class="mb-4">
          {{ t('auth.text') }}
        </p>
        <div v-if="loggedIn">
          logged in as: {{ userKey }}
        </div>
        <AnimatedLoadingWheel v-else-if="fetchingLogin" />
        <LightningQrCode
          v-else-if="lnurl != null"
          :value="lnurl"
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
import { BACKEND_API_ORIGIN } from '@/constants'

const { t } = useI18n()
const emit = defineEmits(['close'])

const fetchingLogin = ref(true)
const lnurl = ref<string>()
const hash = ref<string>()
const loggedIn = ref(false)
const userKey = ref<string>()
let socket: Socket

const checkStatus = async () => {
  if (hash.value == null) {
    return
  }
  try {
    const response = await axios.get(`${BACKEND_API_ORIGIN}/api/auth/status/${hash.value}`)
    if (response.data.status === 'success') {
      loggedIn.value = true
      userKey.value = response.data.data
    }
  } catch(error) {
    console.error(error)
  }
  setTimeout(checkStatus, 300)
}

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
  socket = io(BACKEND_API_ORIGIN)
  socket.on('connect', () => {
    socket.emit('waitForLogin', { hash: hash.value })
  })
  socket.on('loggedIn', ({ key }) => {
    loggedIn.value = true
    userKey.value = key
  })
  fetchingLogin.value = false
})

onBeforeUnmount(() => {
  hash.value = undefined
  if (socket != null) {
    socket.close()
  }
})

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
