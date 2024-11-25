<template>
  <TheLayout>
    <div class="bg-grey-light">
      <CenterContainer class="!py-10">
        <div class="flex gap-12 items-center">
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
        <CardsSummary
          class="my-10"
          :cards-summary="{
            cardsSummary: {
              withdrawn: { amount: 210 * 20, count: 20 },
              funded: { amount: 210 * 20, count: 20 },
              unfunded: { amount: 210 * 20, count: 20 },
              userActionRequired: { amount: 210 * 0, count: 0 },
            },
            status: 'success',
          }"
        />
      </CenterContainer>
    </div>
    <CenterContainer class="py-14">
      <HeadlineDefault
        level="h2"
      >
        {{ $t('nav.sets') }}
      </HeadlineDefault>
      <SetsList
        :sets="sets"
        :cards-summary-by-set-id="cardsSummaryWithStatusBySetId"
        :fetching="fetchingAllSets && sets.length < 3"
        :message="sets.length > 0 && sets.length === 0 ? $t('sets.noSetsMatchingFilter') : undefined"
        class="my-7"
        @enter-viewport="setsStore.loadCardsSummaryForSet"
      />
      <div class="text-center">
        <LinkDefault
          v-if="isLoggedIn"
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

import CardsSummary from '@/components/CardsSummary.vue'
import IconPersonCircleFilled from '@/components/icons/IconPersonCircleFilled.vue'
import CenterContainer from '@/components/layout/CenterContainer.vue'
import TheLayout from '@/components/layout/TheLayout.vue'
import HeadlineDefault from '@/components/typography/HeadlineDefault.vue'
import LinkDefault from '@/components/typography/LinkDefault.vue'
import { useAuthStore } from '@/stores/auth'
import { useProfileStore } from '@/stores/profile'
import { useModalLoginStore } from '@/stores/modalLogin'
import SetsList from '../sets/components/SetsList.vue'
import { useSetsStore } from '@/stores/sets'
import { onMounted } from 'vue'

const profileStore = useProfileStore()
const { userDisplayName } = storeToRefs(profileStore)

const authStore = useAuthStore()
const { isLoggedIn } = storeToRefs(authStore)

const modalLoginStore = useModalLoginStore()
const { showModalLogin } = storeToRefs(modalLoginStore)

const setsStore = useSetsStore()
const { limit, sets, cardsSummaryWithStatusBySetId, fetchingAllSets } = storeToRefs(setsStore)
limit.value = 3

onMounted(() => {
  setsStore.loadSets()
})
</script>
