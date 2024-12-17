<template>
  <div class="bg-grey-light">
    <CenterContainer class="!pt-10 !pb-5">
      <div class="flex gap-9 items-start">
        <IconPersonCircleFilled class="w-12 h-12" />
        <div class="flex-1">
          <HeadlineDefault
            level="h2"
            styling="h3"
            class="mb-1"
          >
            {{ $t('dashboard.welcome') }}
          </HeadlineDefault>
          <LinkDefault
            v-if="isLoggedIn"
            :to="{ name: 'user-account' }"
            no-bold
            class="text-lg"
          >
            {{ userDisplayName || $t('userAccount.completeProfile') }}
          </LinkDefault>
          <LinkDefault
            v-else
            no-bold
            class="text-lg"
            data-test="dashboard-login-link"
            @click="showModalLogin = true"
          >
            {{ $t('general.login') }}
          </LinkDefault>
        </div>
      </div>
      <hr class="my-7 border-t border-grey-dark">
      <CardsSummary
        class="mt-7 mb-5"
        :cards-summary-with-loading-status="cardsSummaryWithLoadingStatus"
        :user-error-messages="cardsSummaryErrorMessages"
        :preview="!isLoggedIn"
        :open-tasks-href="openTasksHref"
      />
      <ButtonContainer>
        <ButtonDefault
          :to="{ name: 'cards' }"
          class="w-full"
        >
          {{ $t('home.buttonCreate') }}
        </ButtonDefault>
      </ButtonContainer>
    </CenterContainer>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'

import useTRpc from '@/modules/useTRpc'
import { useAuthStore } from '@/stores/auth'
import { useModalLoginStore } from '@/stores/modalLogin'
import { useProfileStore } from '@/stores/profile'
import type { CardsSummaryWithLoadingStatus } from '@/data/CardsSummaryWithLoadingStatus'
import CardsSummary from '@/components/cardsSummary/CardsSummary.vue'
import IconPersonCircleFilled from '@/components/icons/IconPersonCircleFilled.vue'
import CenterContainer from '@/components/layout/CenterContainer.vue'
import HeadlineDefault from '@/components/typography/HeadlineDefault.vue'
import LinkDefault from '@/components/typography/LinkDefault.vue'
import ButtonDefault from '@/components/buttons/ButtonDefault.vue'
import ButtonContainer from '@/components/buttons/ButtonContainer.vue'

defineProps({
  openTasksHref: {
    type: String,
    default: undefined,
  },
})

const { t } = useI18n()

const profileStore = useProfileStore()
const { userDisplayName } = storeToRefs(profileStore)

const authStore = useAuthStore()
const { isLoggedIn } = storeToRefs(authStore)

const modalLoginStore = useModalLoginStore()
const { showModalLogin } = storeToRefs(modalLoginStore)

const { card } = useTRpc()
const cardsSummaryWithLoadingStatus = ref<CardsSummaryWithLoadingStatus>({ status: 'notLoaded' })
const cardsSummaryErrorMessages = ref<string[]>([])
const loadCardsSummary = async () => {
  if (!isLoggedIn.value) {
    return
  }
  cardsSummaryWithLoadingStatus.value = { status: 'loading' }
  cardsSummaryErrorMessages.value = []
  try {
    const cardsSummary = await card.cardsSummary.query()
    cardsSummaryWithLoadingStatus.value = { cardsSummary, status: 'success' }
  } catch (error) {
    console.error(error)
    cardsSummaryErrorMessages.value = [t('dashboard.errors.unableToLoadCardsSummaryFromBackend')]
    cardsSummaryWithLoadingStatus.value = { status: 'error' }
  }
}
onMounted(loadCardsSummary)
watch(isLoggedIn, (isLoggedIn) => {
  if (!isLoggedIn) {
    cardsSummaryWithLoadingStatus.value = { status: 'notLoaded' }
    cardsSummaryErrorMessages.value = []
  }
  loadCardsSummary()
})
</script>
