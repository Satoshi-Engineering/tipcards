<template>
  <TheLayout login-banner>
    <CenterContainer class="mb-10">
      <BackLink :to="{ name: 'home', params: { lang: $route.params.lang }}">
        {{ $t('sets.backLink') }}
      </BackLink>
      <div class="flex justify-between">
        <HeadlineDefault
          level="h1"
          styling="h2"
          data-test="headline"
        >
          {{ $t('sets.title') }}
        </HeadlineDefault>
        <ButtonIcon
          icon="plus"
          size="small"
          variant="yellow"
          class="-mt-5"
          data-test="button-new-set"
          :to="{ name: 'cards', params: { lang: $route.params.lang } }"
        >
          {{ $t('sets.newSet') }}
        </ButtonIcon>
      </div>
      <div class="flex flex-col">
        <div>
          <ParagraphDefault>
            {{ $t('sets.description') }}
          </ParagraphDefault>
          <SetsFilterSection
            class="my-8"
            @text-search="textSearch = $event"
          />
          <div class="text-sm" data-test="sets-list-sets-count">
            {{
              fetchingAllSets
                ? '&nbsp;'
                : $t('sets.displayedSetsOfTotalSets', { displayedSets: filteredSets.length, totalSets: sets.length }, sets.length)
            }}
          </div>
          <SetsList
            :sets="filteredSets"
            :cards-summary-by-set-id="cardsSummaryWithStatusBySetId"
            :fetching="fetchingAllSets"
            sorting="changed"
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
            <template v-else-if="sets.length > 0 && filteredSets.length === 0" #message>
              <ParagraphDefault class="text-center">
                {{ $t('sets.noSetsMatchingFilter') }}
              </ParagraphDefault>
            </template>
          </SetsList>
        </div>
      </div>
      <SetsInLocalStorageWarning class="mt-8" />
    </CenterContainer>
  </TheLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'

import TheLayout from '@/components/layout/TheLayout.vue'
import CenterContainer from '@/components/layout/CenterContainer.vue'
import BackLink from '@/components/BackLink.vue'
import HeadlineDefault from '@/components/typography/HeadlineDefault.vue'
import UserErrorMessages from '@/components/UserErrorMessages.vue'
import ParagraphDefault from '@/components/typography/ParagraphDefault.vue'
import ButtonIcon from '@/components/buttons/ButtonIcon.vue'
import SetsList from '@/components/setsList/SetsList.vue'
import SetsFilterSection from '@/pages/sets/components/SetsFilterSection.vue'
import SetsInLocalStorageWarning from '@/pages/sets/components/SetsInLocalStorageWarning.vue'

import { useSetsStore } from '@/stores/sets'
import type { SetDto } from '@shared/data/trpc/SetDto'
import SetDisplayInfo from '@/pages/sets/modules/SetDisplayInfo'
import { useAuthStore } from '@/stores/auth'
import SetsListMessageNotLoggedIn from '@/components/setsList/SetsListMessageNotLoggedIn.vue'
import SetsListMessageEmpty from '@/components/setsList/SetsListMessageEmpty.vue'

const { isLoggedIn } = storeToRefs(useAuthStore())

const setsStore = useSetsStore()
const { sets, cardsSummaryWithStatusBySetId, fetchingAllSets, fetchingAllSetsUserErrorMessages } = storeToRefs(setsStore)

onMounted(() => {
  setsStore.subscribeToLoggedInChanges()
  setsStore.loadSets()
})

onUnmounted(() => {
  setsStore.unsubscribeFromLoggedInChanges()
})

// Search
const textSearch = ref<string>('')

const searchString = computed(() => textSearch.value.trim().toLowerCase())

const i18n = useI18n()

const getSearchableStringForSet = (set: SetDto) => SetDisplayInfo.create(set, i18n).combinedSearchableString

const filteredSets = computed(() => sets.value.filter((set) => getSearchableStringForSet(set).includes(searchString.value)))
</script>
