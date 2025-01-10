<template>
  <TheLayout login-banner>
    <GlobalSummary
      open-tasks-href="#open-tasks"
    />
    <section>
      <CenterContainer class="!py-10">
        <header class="flex items-end gap-4">
          <HeadlineDefault
            level="h2"
            class="mb-0"
          >
            {{ $t('history.title') }}
          </HeadlineDefault>
          <div class="text-sm pb-1 italic" data-test="card-status-list-cards-count">
            {{
              fetchingHistory && historyTotal === 0 || historyTotal == null
                ? '&nbsp;'
                : `(${$t('general.cards', { count: historyTotal }, historyTotal)})`
            }}
          </div>
        </header>
        <CardStatusList
          :card-statuses="history.slice(0, 3)"
          :loading="history.length < 1 && fetchingHistory"
          :reloading="history.length > 0 && fetchingHistory"
          :user-error-messages="fetchingHistoryUserErrorMessages"
          :not-logged-in="!isLoggedIn"
          class="my-7"
        />
        <div v-if="isLoggedIn" class="text-center">
          <LinkDefault
            :to="{ name: 'history', params: { lang: $route.params.lang } }"
            no-bold
            class="text-lg"
            data-test="link-to-full-history"
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
          <div class="text-sm pb-1 italic" data-test="sets-list-sets-count">
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
          :loading="fetchingAllSets"
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
            data-test="link-to-all-my-sets"
          >
            {{ $t('dashboard.allMySets') }}
          </LinkDefault>
        </div>
      </CenterContainer>
    </section>
    <OpenTasks id="open-tasks" />
  </TheLayout>
</template>
<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { onMounted, onUnmounted } from 'vue'

import { useAuthStore } from '@/stores/auth'
import { useSetsStore } from '@/stores/sets'
import { useHistoryStore } from '@/stores/historyStore'
import CenterContainer from '@/components/layout/CenterContainer.vue'
import TheLayout from '@/components/layout/TheLayout.vue'
import HeadlineDefault from '@/components/typography/HeadlineDefault.vue'
import LinkDefault from '@/components/typography/LinkDefault.vue'

import SetsList from '@/components/setsList/SetsList.vue'
import CardStatusList from '@/components/cardStatusList/CardStatusList.vue'

import GlobalSummary from '@/pages/dashboard/components/GlobalSummary.vue'
import OpenTasks from '@/pages/dashboard/components/OpenTasks.vue'

const authStore = useAuthStore()
const { isLoggedIn } = storeToRefs(authStore)

// history
const historyStore = useHistoryStore()
const { history, historyTotal, fetchingHistory, fetchingHistoryUserErrorMessages } = storeToRefs(historyStore)

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
