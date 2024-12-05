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
    <section>
      <CenterContainer class="!py-10">
        <HeadlineDefault
          level="h2"
          class="mb-0"
        >
          {{ $t('dashboard.history') }}
        </HeadlineDefault>
        <CardStatusList
          :card-statuses="history.slice(0, 3)"
          class="my-7"
        />
        <div v-if="isLoggedIn" class="text-center">
          <LinkDefault
            :to="{ name: 'dashboard', params: { lang: $route.params.lang } }"
            no-bold
            class="text-lg"
          >
            {{ $t('dashboard.fullHistory') }}
          </LinkDefault>
        </div>
      </CenterContainer>
    </section>
    <section>
      <CenterContainer class="!py-10">
        <header class="flex items-end gap-4">
          <HeadlineDefault
            level="h2"
            class="mb-0"
          >
            {{ $t('nav.sets') }}
          </HeadlineDefault>
          <div class="text-sm pb-1" data-test="sets-list-sets-count">
            {{
              fetchingAllSets && sets.length === 0
                ? '&nbsp;'
                : `(${$t('general.sets', { sets: sets.length }, sets.length)})`
            }}
          </div>
        </header>
        <SetsList
          :sets="sets.slice(0, 3)"
          :cards-summary-by-set-id="cardsSummaryWithStatusBySetId"
          :fetching="fetchingAllSets"
          :not-logged-in="!isLoggedIn"
          :user-error-messages="fetchingAllSetsUserErrorMessages"
          class="my-7"
          @enter-viewport="setsStore.loadCardsSummaryForSet"
        />
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
    </section>
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
import type { CardsSummaryWithLoadingStatus } from '@/data/CardsSummaryWithLoadingStatus'
import useTRpc from '@/modules/useTRpc'
import { useAuthStore } from '@/stores/auth'
import { useModalLoginStore } from '@/stores/modalLogin'
import { useProfileStore } from '@/stores/profile'
import { useSetsStore } from '@/stores/sets'
import ButtonDefault from '@/components/buttons/ButtonDefault.vue'
import ButtonContainer from '@/components/buttons/ButtonContainer.vue'
import CardStatusList from '@/components/cardStatusList/CardStatusList.vue'
import { useHistoryStore } from '@/stores/historyStore'

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

// history
const historyStore = useHistoryStore()
const { history } = storeToRefs(historyStore)

// sets
const setsStore = useSetsStore()
const { sets, cardsSummaryWithStatusBySetId, fetchingAllSets, fetchingAllSetsUserErrorMessages } = storeToRefs(setsStore)

onMounted(() => {
  setsStore.subscribeToLoggedInChanges()
  setsStore.loadSets()
  historyStore.subscribeToLoggedInChanges(3)
  historyStore.loadHistory(3)
})

onUnmounted(() => {
  setsStore.unsubscribeFromLoggedInChanges()
  historyStore.unsubscribeFromLoggedInChanges()
})
</script>
