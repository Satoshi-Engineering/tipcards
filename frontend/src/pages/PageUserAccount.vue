<template>
  <TheLayout>
    <template v-if="isLoggedIn">
      <CenterContainer>
        <HeadlineDefault level="h1" class="text-center">
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
          <ButtonContainer>
            <ButtonDefault
              type="submit"
              :disabled="fetching || saving"
              :loading="saving"
            >
              <span>
                {{ $t('userAccount.form.save') }}
              </span>
              <IconCheckSquareFill v-if="isSaved && !saving" class="inline-block ms-2 h-[1em] w-[1em]" />
              <IconExclamationSquare v-else-if="!saving" class="inline-block ms-2 h-[1em] w-[1em]" />
              <span v-else-if="saving" class="inline-block ms-2 h-[1em] w-[1em]" />
            </ButtonDefault>
            <UserErrorMessages :user-error-messages="profileUserErrorMessages" />
          </ButtonContainer>
        </form>
      </CenterContainer>
      <div class="bg-gradient-to-b from-grey-light to-transparent">
        <CenterContainer>
          <ButtonContainer class="my-10">
            <HeadlineDefault level="h2" class="text-center">
              {{ $t('auth.buttonLogout') }}
            </HeadlineDefault>
            <ButtonDefault @click="onLogout">
              {{ $t('auth.buttonLogout') }}
            </ButtonDefault>
            <ButtonDefault
              :disabled="loggingOutAllOtherDevices"
              :loading="loggingOutAllOtherDevices"
              @click="logoutAllOtherDevices"
            >
              <span>
                {{ $t('auth.buttonLogoutAllOtherDevices') }}
              </span>
              <IconCheckSquareFill v-if="loggingOutAllOtherDevicesSuccess" class="inline-block ms-2 h-[1em] w-[1em]" />
            </ButtonDefault>
            <small class="block">({{ $t('userAccount.logoutAllOtherDevicesHint') }})</small>
            <UserErrorMessages :user-error-messages="logoutUserErrorMessages" />
          </ButtonContainer>
        </CenterContainer>
      </div>
    </template>
  </TheLayout>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watchEffect, onBeforeMount } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import isEqual from 'lodash.isequal'
import { useI18n } from 'vue-i18n'
import { storeToRefs } from 'pinia'

import { Profile } from '@shared/data/auth/User'

import TheLayout from '@/components/layout/TheLayout.vue'
import CenterContainer from '@/components/layout/CenterContainer.vue'
import ButtonDefault from '@/components/buttons/ButtonDefault.vue'
import HeadlineDefault from '@/components/typography/HeadlineDefault.vue'
import UserErrorMessages from '@/components/UserErrorMessages.vue'
import useAuthService from '@/modules/useAuthService'
import { useAuthStore } from '@/stores/auth'
import IconCheckSquareFill from '@/components/icons/IconCheckSquareFill.vue'
import IconExclamationSquare from '@/components/icons/IconExclamationSquare.vue'
import ButtonContainer from '@/components/buttons/ButtonContainer.vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const { logout } = authStore
const { isLoggedIn } = storeToRefs(authStore)
const { t } = useI18n()
const authService = useAuthService()

const profile = ref(Profile.parse({}))
const profileInternal = reactive(Profile.parse({}))
const profileUserErrorMessages = ref<string[]>([])

const fetching = ref(false)
onBeforeMount(async () => {
  fetching.value = true
  try {
    const { data } = await authService.get('profile')
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
    const { data } = await authService.post('profile', profileInternal)
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
  router.push({ name: 'home', params: { lang: route.params.lang } })
}

const loggingOutAllOtherDevices = ref(false)
const loggingOutAllOtherDevicesSuccess = ref(false)
const logoutAllOtherDevices = async () => {
  loggingOutAllOtherDevices.value = true
  loggingOutAllOtherDevicesSuccess.value = false
  logoutUserErrorMessages.value = []
  try {
    await authService.post('logoutAllOtherDevices')
    loggingOutAllOtherDevicesSuccess.value = true
  } catch (error) {
    console.error(error)
    logoutUserErrorMessages.value.push(t('userAccount.errors.unableToLogoutAllOtherDevices'))
  }
  loggingOutAllOtherDevices.value = false
}

watchEffect(() => {
  if (isLoggedIn.value === false) {
    router.push({ name: 'home', params: { lang: route.params.lang } })
  }
})
</script>
