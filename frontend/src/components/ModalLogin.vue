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
import { onBeforeUnmount, onMounted, ref } from 'vue'

import { LnurlAuthLoginStatusEnum } from '@shared/auth/data/trpc/LnurlAuthLoginStatusEnum'

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
const id = ref<string>()
const hash = ref<string>()
const loginFailed = ref(false)
const missingEmail = ref(false)
const subscription = ref<Unsubscribable>()

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

const createLnurl = async () => {
  fetchingLogin.value = true
  const lnurlAuth = await trpcAuth.lnurlAuth.create.query()
  lnurl.value = lnurlAuth.lnurlAuth
  hash.value = lnurlAuth.hash
  id.value = lnurlAuth.id
  fetchingLogin.value = false
}

const subscribeToLogin = async () => {
  if (isLoggedIn.value || fetchingLogin.value) {
    return
  }
  if (id.value == null) {
    loginFailed.value = true
    console.error('subscribeToLogin: id is null')
    return
  }
  subscription.value = trpcAuth.lnurlAuth.login.subscribe(
    {
      lastEventId: id.value,
    },
    {
      onData: (lnurlAuthLoginDto) => {
        subscription.value?.unsubscribe()
        if (
          lnurlAuthLoginDto.data.status === LnurlAuthLoginStatusEnum.enum.loggedIn
          && hash.value != null
        ) {
          safeLogin(hash.value)
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
}

onMounted(async () => {
  await createLnurl()
  await subscribeToLogin()
})

onBeforeUnmount(() => {
  lnurl.value = undefined
  hash.value = undefined
  id.value = undefined
  subscription.value?.unsubscribe()
})
</script>
