<template>
  <ModalDefault
    data-test="modal-login"
    @close="$emit('close')"
  >
    <div class="text-center">
      <HeadlineDefault level="h1">
        {{ $t('auth.modalLogin.headline') }}
      </HeadlineDefault>
      <ParagraphDefault
        v-if="modalLoginUserMessage != null"
        class="mb-5 p-3 border border-red-500 text-red-500"
        data-test="modal-login-user-message"
      >
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
        <LinkDefault
          :to="{ name: 'user-account', params: { lang: $route.params.lang } }"
          data-test="emailCta"
          @click="$emit('close')"
        >
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
import type { Unsubscribable } from '@trpc/server/observable'
import { storeToRefs } from 'pinia'
import { onBeforeMount, onBeforeUnmount, ref } from 'vue'

import { LnurlAuthLoginStatusEnum } from '@shared/auth/data/trpc/LnurlAuthLoginDto'

import { useProfileStore } from '@/stores/profile'
import useTRpcAuth from '@/modules/useTRpcAuth'
import ModalDefault from '@/components/ModalDefault.vue'
import LightningQrCode from '@/components/LightningQrCode.vue'
import ButtonDefault from '@/components/buttons/ButtonDefault.vue'
import LinkDefault from '@/components/typography/LinkDefault.vue'
import ParagraphDefault from '@/components/typography/ParagraphDefault.vue'
import { useAuthStore } from '@/stores/auth'
import { useModalLoginStore } from '@/stores/modalLogin'
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
const loginFailed = ref(false)
const missingEmail = ref(false)
let subscription: Unsubscribable

const safeLogin = async (hash: string) => {
  fetchingLogin.value = true
  try {
    await login(hash)
  } catch (error) {
    loginFailed.value = true
    console.error(error)
    return
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
}

const trpcAuth = useTRpcAuth()
onBeforeMount(async () => {
  subscription = trpcAuth.lnurlAuth.login.subscribe(
    undefined,
    {
      onData: (lnurlAuthLoginDto) => {
        if (lnurlAuthLoginDto.data.status === LnurlAuthLoginStatusEnum.enum.lnurlCreated) {
          fetchingLogin.value = false
          lnurl.value = lnurlAuthLoginDto.data.lnurlAuth
          return
        }

        subscription?.unsubscribe()

        if (
          lnurlAuthLoginDto.data.status === LnurlAuthLoginStatusEnum.enum.loggedIn
          && lnurlAuthLoginDto.data.hash != null
        ) {
          safeLogin(lnurlAuthLoginDto.data.hash)
        } else if (lnurlAuthLoginDto.data.status === LnurlAuthLoginStatusEnum.enum.failed) {
          loginFailed.value = true
        }
      },
      onError: (error) => {
        loginFailed.value = true
        console.error('trpc.subscription.onError', error)
      },
    },
  )
})

onBeforeUnmount(() => {
  lnurl.value = undefined
  subscription?.unsubscribe()
})
</script>
