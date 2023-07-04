<template>
  <div
    v-if="isLoggedIn"
    class="mt-3 mx-auto w-full max-w-md px-4"
  >
    <HeadlineDefault level="h2">{{ $t('userAccount.title') }}</HeadlineDefault>
    <form class="block my-10" @submit.prevent="save">
      <label class="block mb-2">
        <span class="block">
          {{ $t('userAccount.form.emailAddress') }}:
        </span>
        <input
          v-model.lazy.trim="emailAddress"
          type="email"
          class="w-full border my-1 px-3 py-2 focus:outline-none"
        >
        <small class="block">({{ $t('userAccount.form.emailAddressHint') }})</small>
      </label>
      <ButtonDefault
        class="text-sm min-w-[170px]"
        type="submit"
        :disabled="saving"
        :loading="saving"
      >
        {{ $t('userAccount.form.save') }}
        <i v-if="isSaved && !saving" class="bi bi-check-square-fill ml-1" />
        <i v-else-if="!saving" class="bi bi-exclamation-square ml-1" />
      </ButtonDefault>
    </form>
    <div class="my-10">
      <HeadlineDefault level="h3">
        {{ $t('auth.buttonLogout') }}
      </HeadlineDefault>
      <ButtonDefault class="text-sm min-w-[170px]" @click="onLogout">
        {{ $t('auth.buttonLogout') }}
      </ButtonDefault>
      <br>
      <ButtonDefault class="text-sm min-w-[170px]" @click="logoutAllOtherDevices">
        {{ $t('auth.buttonLogoutAllOtherDevices') }}
      </ButtonDefault>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watchEffect } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

import { BACKEND_API_ORIGIN } from '@/constants'
import { useUserStore } from '@/stores/user' 
import ButtonDefault from '@/components/ButtonDefault.vue'
import HeadlineDefault from '@/components/typography/HeadlineDefault.vue'

const router = useRouter()
const { isLoggedIn, logout } = useUserStore()

const emailAddress = ref<string | undefined>()

const isSaved = computed(() => false)

const saving = ref(false)
const save = async () => {
  saving.value = true
  await new Promise((resolve) => setTimeout(resolve, 1234))
  saving.value = false
}

const onLogout = () => {
  logout()
  router.push({ name: 'home' })
}

const logoutAllOtherDevices = async () => {
  try {
    await axios.post(`${BACKEND_API_ORIGIN}/api/auth/logoutAllOtherDevices`)
  } catch (error) {
    // TODO: show error to user
    console.error(error)
  }
}

watchEffect(() => {
  if (isLoggedIn === false) {
    router.push({ name: 'home' })
  }
})
</script>
