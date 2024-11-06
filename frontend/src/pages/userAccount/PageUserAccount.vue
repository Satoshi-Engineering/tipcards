<template>
  <TheLayout>
    <template v-if="isLoggedIn">
      <CenterContainer class="mb-10">
        <HeadlineDefault level="h1" class="text-center">
          {{ $t('userAccount.title') }}
        </HeadlineDefault>

        <ProfileForm />
      </CenterContainer>

      <div class="pt-5 bg-gradient-to-b from-grey-light to-transparent">
        <CenterContainer>
          <HeadlineDefault level="h2" class="text-center">
            {{ $t('general.logout') }}
          </HeadlineDefault>
          <ButtonContainer class="my-10">
            <ButtonDefault @click="onLogout">
              {{ $t('general.logout') }}
            </ButtonDefault>
          </ButtonContainer>
          <ButtonContainer class="my-10">
            <ButtonDefault
              variant="secondary"
              data-test="user-account-button-logout-all-other-devices"
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
          </ButtonContainer>
          <UserErrorMessages :user-error-messages="logoutUserErrorMessages" />
        </CenterContainer>
      </div>
    </template>
  </TheLayout>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { ref, watchEffect } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter, useRoute } from 'vue-router'

import ButtonContainer from '@/components/buttons/ButtonContainer.vue'
import ButtonDefault from '@/components/buttons/ButtonDefault.vue'
import IconCheckSquareFill from '@/components/icons/IconCheckSquareFill.vue'
import TheLayout from '@/components/layout/TheLayout.vue'
import CenterContainer from '@/components/layout/CenterContainer.vue'
import HeadlineDefault from '@/components/typography/HeadlineDefault.vue'
import UserErrorMessages from '@/components/UserErrorMessages.vue'
import useAuth from '@/modules/useAuth'
import { useAuthStore } from '@/stores/auth'

import ProfileForm from './ProfileForm.vue'

const router = useRouter()
const route = useRoute()
const auth = useAuth()
const authStore = useAuthStore()
const { logout } = authStore
const { isLoggedIn } = storeToRefs(authStore)
const { t } = useI18n()

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
    await auth.logoutAllOtherDevicesWithUnauthorizedHandling()
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
