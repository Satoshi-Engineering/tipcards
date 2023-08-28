<template>
  <div
    v-if="isLoggedIn"
    class="mt-3 mx-auto w-full max-w-md px-4"
  >
    <HeadlineDefault level="h2">
      {{ $t('userAccount.title') }}
    </HeadlineDefault>
    <form class="block my-10" @submit.prevent="save">
      <label class="block mb-2">
        <span class="block">
          {{ $t('userAccount.form.accountName') }}:
        </span>
        <input
          v-model.lazy.trim="profileInternal.accountName"
          type="text"
          class="w-full border my-1 px-3 py-2 focus:outline-none"
          :disabled="fetching || saving"
        >
        <small class="block">({{ $t('userAccount.form.accountNameHint') }})</small>
      </label>
      <label class="block mb-2">
        <span class="block">
          {{ $t('userAccount.form.displayName') }}:
        </span>
        <input
          v-model.lazy.trim="profileInternal.displayName"
          type="text"
          class="w-full border my-1 px-3 py-2 focus:outline-none"
          :disabled="fetching || saving"
        >
        <small class="block">({{ $t('userAccount.form.displayNameHint') }})</small>
      </label>
      <label class="block mb-2">
        <span class="block">
          {{ $t('userAccount.form.emailAddress') }}:
        </span>
        <input
          v-model.lazy.trim="profileInternal.email"
          type="email"
          class="w-full border my-1 px-3 py-2 focus:outline-none"
          :disabled="fetching || saving"
        >
        <small class="block">({{ $t('userAccount.form.emailAddressHint') }})</small>
      </label>
      <ButtonDefault
        class="text-sm min-w-[170px]"
        type="submit"
        :disabled="fetching || saving"
        :loading="saving"
      >
        {{ $t('userAccount.form.save') }}
        <i v-if="isSaved && !saving" class="bi bi-check-square-fill ml-1" />
        <i v-else-if="!saving" class="bi bi-exclamation-square ml-1" />
      </ButtonDefault>
      <UserErrorMessages :user-error-messages="profileUserErrorMessages" />
    </form>
    <div class="my-10">
      <HeadlineDefault level="h3">
        {{ $t('auth.buttonLogout') }}
      </HeadlineDefault>
      <ButtonDefault class="text-sm min-w-[170px]" @click="onLogout">
        {{ $t('auth.buttonLogout') }}
      </ButtonDefault>
      <br>
      <ButtonDefault
        class="text-sm min-w-[170px]"
        :disabled="loggingOutAllOtherDevices"
        :loading="loggingOutAllOtherDevices"
        @click="logoutAllOtherDevices"
      >
        {{ $t('auth.buttonLogoutAllOtherDevices') }}
        <i v-if="loggingOutAllOtherDevicesSuccess" class="bi bi-check-square-fill ml-1" />
      </ButtonDefault>
      <small class="block">({{ $t('userAccount.logoutAllOtherDevicesHint') }})</small>
      <UserErrorMessages :user-error-messages="logoutUserErrorMessages" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watchEffect, onBeforeMount } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import isEqual from 'lodash.isequal'
import { useI18n } from 'vue-i18n'
import { storeToRefs } from 'pinia'

import { Profile } from '@root/data/User'

import { TIPCARDS_AUTH_ORIGIN } from '@/constants'
import { useUserStore } from '@/stores/user' 
import ButtonDefault from '@/components/ButtonDefault.vue'
import HeadlineDefault from '@/components/typography/HeadlineDefault.vue'
import UserErrorMessages from '@/components/UserErrorMessages.vue'

const router = useRouter()
const userStore = useUserStore()
const { logout } = userStore
const { isLoggedIn } = storeToRefs(userStore)
const { t } = useI18n()

const profile = ref(Profile.parse({}))
const profileInternal = reactive(Profile.parse({}))
const profileUserErrorMessages = ref<string[]>([])

const fetching = ref(false)
onBeforeMount(async () => {
  fetching.value = true
  try {
    const { data } = await axios.get(`${TIPCARDS_AUTH_ORIGIN}/api/auth/profile`)
    profile.value = Profile.parse(data.data)
    Object.assign(profileInternal, profile.value)
  } catch (error) {
    console.error(error)
    profileUserErrorMessages.value.push(t('userAccount.errors.unableToFetchProfile'))
  }
  fetching.value = false
})
const isSaved = computed(() => isEqual(profile.value, profileInternal))

const saving = ref(false)
const save = async () => {
  profileUserErrorMessages.value = []
  saving.value = true
  try {
    const { data } = await axios.post(`${TIPCARDS_AUTH_ORIGIN}/api/auth/profile`, profileInternal)
    profile.value = Profile.parse(data.data)
  } catch (error) {
    console.error(error)
    profileUserErrorMessages.value.push(t('userAccount.errors.unableToSaveProfile'))
  }
  saving.value = false
}

const logoutUserErrorMessages = ref<string[]>([])

const onLogout = () => {
  logout()
  router.push({ name: 'home' })
}

const loggingOutAllOtherDevices = ref(false)
const loggingOutAllOtherDevicesSuccess = ref(false)
const logoutAllOtherDevices = async () => {
  loggingOutAllOtherDevices.value = true
  loggingOutAllOtherDevicesSuccess.value = false
  logoutUserErrorMessages.value = []
  try {
    await axios.post(`${TIPCARDS_AUTH_ORIGIN}/api/auth/logoutAllOtherDevices`)
  loggingOutAllOtherDevicesSuccess.value = true
  } catch (error) {
    console.error(error)
    logoutUserErrorMessages.value.push(t('userAccount.errors.unableToLogoutAllOtherDevices'))
  }
  loggingOutAllOtherDevices.value = false
}

watchEffect(() => {
  if (isLoggedIn.value === false) {
    router.push({ name: 'home' })
  }
})
</script>
