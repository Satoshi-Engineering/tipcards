<template>
  <TheLayout>
    <template v-if="isLoggedIn">
      <CenterContainer>
        <HeadlineDefault level="h1" class="text-center">
          {{ $t('userAccount.title') }}
        </HeadlineDefault>
        <form class="block my-10" @submit.prevent="update(profileInternal)">
          <label class="block mb-2">
            <span class="block">
              {{ $t('userAccount.form.accountName') }}:
            </span>
            <input
              v-model.lazy.trim="profileInternal.accountName"
              type="text"
              class="w-full border my-1 px-3 py-2 focus:outline-none"
              :disabled="fetching"
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
              :disabled="fetching"
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
              :disabled="fetching"
            >
            <small class="block">({{ $t('userAccount.form.emailAddressHint') }})</small>
          </label>
          <ButtonContainer>
            <ButtonDefault
              type="submit"
              :loading="fetching"
            >
              <span>
                {{ $t('userAccount.form.save') }}
              </span>
              <IconCheckSquareFill v-if="isSaved && !fetching" class="inline-block ms-2 h-[1em] w-[1em]" />
              <IconExclamationSquare v-else-if="!fetching" class="inline-block ms-2 h-[1em] w-[1em]" />
              <span v-else-if="fetching" class="inline-block ms-2 h-[1em] w-[1em]" />
            </ButtonDefault>
            <UserErrorMessages :user-error-messages="fetchingUserErrorMessages" />
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
import { ref, reactive, computed, watchEffect, onBeforeMount, onBeforeUnmount } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import isEqual from 'lodash.isequal'
import { useI18n } from 'vue-i18n'
import { storeToRefs } from 'pinia'

import { Profile } from '@shared/data/trpc/Profile'

import IconCheckSquareFill from '@/components/icons/IconCheckSquareFill.vue'
import IconExclamationSquare from '@/components/icons/IconExclamationSquare.vue'
import ButtonContainer from '@/components/buttons/ButtonContainer.vue'
import TheLayout from '@/components/layout/TheLayout.vue'
import CenterContainer from '@/components/layout/CenterContainer.vue'
import ButtonDefault from '@/components/buttons/ButtonDefault.vue'
import HeadlineDefault from '@/components/typography/HeadlineDefault.vue'
import UserErrorMessages from '@/components/UserErrorMessages.vue'
import useAuthService from '@/modules/useAuthService'
import { useAuthStore } from '@/stores/auth'
import useProfile from '@/stores/useProfile'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const { logout } = authStore
const { isLoggedIn } = storeToRefs(authStore)
const { t } = useI18n()
const authService = useAuthService()

const {
  userAccountName,
  userDisplayName,
  userEmail,
  fetching,
  fetchingUserErrorMessages,
  subscribe,
  unsubscribe,
  update,
} = useProfile()

const profileInternal = reactive(Profile.partial().parse({}))

onBeforeMount(async () => {
  try {
    await subscribe()
    profileInternal.accountName = userAccountName.value
    profileInternal.displayName = userDisplayName.value
    profileInternal.email = userEmail.value
  } catch (error) {
    // do nothing
  }
})
onBeforeUnmount(unsubscribe)
const isSaved = computed(() => isEqual({
  accountName: userAccountName.value,
  displayName: userDisplayName.value,
  email: userEmail.value,
}, profileInternal))

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
watchEffect(() => {
  if (userAccountName.value != null && profileInternal.accountName == null) {
    profileInternal.accountName = userAccountName.value
  }
})
watchEffect(() => {
  if (userDisplayName.value != null && profileInternal.displayName == null) {
    profileInternal.displayName = userDisplayName.value
  }
})
watchEffect(() => {
  if (userEmail.value != null && profileInternal.email == null) {
    profileInternal.email = userEmail.value
  }
})
</script>
