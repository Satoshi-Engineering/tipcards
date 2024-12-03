<template>
  <TheLayout login-banner>
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
    <CenterContainer class="!py-10">
      <div class="flex items-end gap-4">
        <HeadlineDefault
          level="h2"
          class="mb-0"
        >
          {{ $t('nav.sets') }}
        </HeadlineDefault>
        <div class="text-sm pb-1" data-test="sets-list-sets-count">
          ({{
            fetchingAllSets
              ? '&nbsp;'
              : $t('general.sets', { sets: sets.length }, sets.length)
          }})
        </div>
      </div>
      <SetsList
        :sets="sets.slice(0, 3)"
        :cards-summary-by-set-id="cardsSummaryWithStatusBySetId"
        :fetching="fetchingAllSets && sets.length < 3"
        class="my-7"
        @enter-viewport="setsStore.loadCardsSummaryForSet"
      >
        <template v-if="!isLoggedIn" #message>
          <SetsListMessageNotLoggedIn />
        </template>
        <template v-else-if="fetchingAllSetsUserErrorMessages.length > 0" #message>
          <UserErrorMessages :user-error-messages="fetchingAllSetsUserErrorMessages" />
        </template>
        <template v-else-if="!fetchingAllSets && sets.length < 1" #message>
          <SetsListMessageEmpty />
        </template>
      </SetsList>
      <div v-if="isLoggedIn" class="text-center">
        <LinkDefault
          :to="{ name: 'sets', params: { lang: $route.params.lang } }"
          no-bold
          class="text-lg"
        >
          {{ $t('dashboard.allMySets') }}
        </LinkDefault>
      </div>
    </CenterContainer>
  </TheLayout>
</template>
<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import CardsSummary from '@/components/cardsSummary/CardsSummary.vue'
import IconPersonCircleFilled from '@/components/icons/IconPersonCircleFilled.vue'
import CenterContainer from '@/components/layout/CenterContainer.vue'
import TheLayout from '@/components/layout/TheLayout.vue'
import HeadlineDefault from '@/components/typography/HeadlineDefault.vue'
import LinkDefault from '@/components/typography/LinkDefault.vue'
import SetsList from '@/components/setsList/SetsList.vue'
import SetsListMessageNotLoggedIn from '@/components/setsList/SetsListMessageNotLoggedIn.vue'
import UserErrorMessages from '@/components/UserErrorMessages.vue'
import SetsListMessageEmpty from '@/components/setsList/SetsListMessageEmpty.vue'
import type { CardsSummaryWithLoadingStatus } from '@/data/CardsSummaryWithLoadingStatus'
import useTRpc from '@/modules/useTRpc'
import { useAuthStore } from '@/stores/auth'
import { useModalLoginStore } from '@/stores/modalLogin'
import { useProfileStore } from '@/stores/profile'
import { useSetsStore } from '@/stores/sets'
import ButtonDefault from '@/components/buttons/ButtonDefault.vue'
import ButtonContainer from '@/components/buttons/ButtonContainer.vue'

const { t } = useI18n()

const profileStore = useProfileStore()
const { userDisplayName } = storeToRefs(profileStore)

const authStore = useAuthStore()
const { isLoggedIn } = storeToRefs(authStore)

const modalLoginStore = useModalLoginStore()
const { showModalLogin } = storeToRefs(modalLoginStore)

// global card status summary
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

// sets
const setsStore = useSetsStore()
const { sets, cardsSummaryWithStatusBySetId, fetchingAllSets, fetchingAllSetsUserErrorMessages } = storeToRefs(setsStore)

onMounted(() => {
  setsStore.subscribeToLoggedInChanges()
  setsStore.loadSets()
})

onUnmounted(() => {
  setsStore.unsubscribeFromLoggedInChanges()
})
</script>
