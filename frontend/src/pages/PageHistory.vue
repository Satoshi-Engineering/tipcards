<template>
  <TheLayout login-banner>
    <CenterContainer>
      <BackLink
        :to="{ name: 'dashboard' }"
      >
        {{ $t('dashboard.title') }}
      </BackLink>
      <HeadlineDefault level="h1">
        {{ $t('history.title') }}
      </HeadlineDefault>
      <div class="text-sm" data-test="card-status-list-cards-count">
        {{
          fetchingHistory || historyTotal == null || historyTotal === 0
            ? '&nbsp;'
            : $t('general.cards', { count: historyTotal }, historyTotal)
        }}
      </div>
      <CardStatusList
        :card-statuses="history"
        :loading="fetchingHistory"
        :user-error-messages="fetchingHistoryUserErrorMessages"
        class="my-7"
      />
      <div v-if="history.length < (historyTotal ?? 0)" class="text-center">
        <LinkDefault
          no-bold
          class="text-lg"
          @click="loadMore"
        >
          {{ $t('general.loadMore') }}
        </LinkDefault>
      </div>
    </CenterContainer>
  </TheLayout>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { onMounted, onUnmounted } from 'vue'

import CardStatusList from '@/components/cardStatusList/CardStatusList.vue'
import TheLayout from '@/components/layout/TheLayout.vue'
import HeadlineDefault from '@/components/typography/HeadlineDefault.vue'
import { useHistoryStore } from '@/stores/historyStore'
import CenterContainer from '@/components/layout/CenterContainer.vue'
import BackLink from '@/components/BackLink.vue'
import LinkDefault from '@/components/typography/LinkDefault.vue'

const itemsPerPage = 50

const historyStore = useHistoryStore()
const { history, historyTotal, fetchingHistory, fetchingHistoryUserErrorMessages } = storeToRefs(historyStore)

const loadMore = () => {
  historyStore.loadHistoryNextPage(itemsPerPage)
}

onMounted(() => {
  historyStore.subscribeToLoggedInChanges(itemsPerPage)
  historyStore.loadHistory(itemsPerPage)
})

onUnmounted(() => {
  historyStore.unsubscribeFromLoggedInChanges()
})
</script>
