<template>
  <div class="flex justify-center items-center fixed top-0 left-0 right-0 w-full h-full p-4 overflow-x-hidden overflow-y-auto bg-grey bg-opacity-50">
    <div class="relative w-full h-full max-w-2xl md:h-auto">
      <!-- Modal content -->
      <div class="relative bg-white rounded-lg shadow p-4">
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
import { onBeforeMount, ref } from 'vue'

import AnimatedLoadingWheel from '@/components/AnimatedLoadingWheel.vue'
import LightningQrCode from '@/components/LightningQrCode.vue'
import { BACKEND_API_ORIGIN } from '@/constants'

const fetchingLogin = ref(true)
const lnurl = ref<string>()
const hash = ref<string>()
const loggedIn = ref(false)
const userKey = ref<string>()

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
  fetchingLogin.value = false
  checkStatus()
})
</script>
