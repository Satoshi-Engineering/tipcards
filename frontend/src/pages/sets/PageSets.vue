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
      <div v-if="!isLoggedIn" data-test="please-login-section">
        <ParagraphDefault>
          {{ $t('sets.loginToSeeYourSets') }}
        </ParagraphDefault>
        <LinkDefault @click="showModalLogin = true">
          {{ $t('general.login') }}
        </LinkDefault>
      </div>
      <div
        v-if="isLoggedIn"
        class="flex flex-col"
        data-test="logged-in"
      >
        <UserErrorMessages
          v-if="fetchingUserErrorMessages.length > 0"
          :user-error-messages="fetchingUserErrorMessages"
        />
        <ParagraphDefault
          v-else-if="!fetchingAllSets && sets.length < 1"
          data-test="sets-list-empty"
        >
          {{ $t('sets.noSavedCardsSetsMessage') }}
        </ParagraphDefault>
        <div v-else data-test="sets-list-with-data">
          <ParagraphDefault>
            {{ $t('sets.description') }}
          </ParagraphDefault>
          <SetsListFilterSection
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
            :message="sets.length > 0 && filteredSets.length === 0 ? $t('sets.noSetsMatchingFilter') : undefined"
            sorting="changed"
            class="my-7"
            @enter-viewport="setsStore.loadCardsSummaryForSet"
          />
        </div>
      </div>
      <SetsInLocalStorageWarning class="mt-8" />
    </CenterContainer>
  </TheLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'

import TheLayout from '@/components/layout/TheLayout.vue'
import CenterContainer from '@/components/layout/CenterContainer.vue'
import BackLink from '@/components/BackLink.vue'
import HeadlineDefault from '@/components/typography/HeadlineDefault.vue'
import UserErrorMessages from '@/components/UserErrorMessages.vue'
import ParagraphDefault from '@/components/typography/ParagraphDefault.vue'
import ButtonIcon from '@/components/buttons/ButtonIcon.vue'
import LinkDefault from '@/components/typography/LinkDefault.vue'
import SetsList from '@/pages/sets/components/SetsList.vue'
import SetsListFilterSection from '@/pages/sets/components/SetsListFilterSection.vue'
import SetsInLocalStorageWarning from '@/pages/sets/components/SetsInLocalStorageWarning.vue'

import { useModalLoginStore } from '@/stores/modalLogin'
import { useSetsStore } from '@/stores/sets'
import type { SetDto } from '@shared/data/trpc/SetDto'
import SetDisplayInfo from '@/pages/sets/modules/SetDisplayInfo'
import { useAuthStore } from '@/stores/auth'

const { showModalLogin } = storeToRefs(useModalLoginStore())

const { isLoggedIn } = storeToRefs(useAuthStore())

const setsStore = useSetsStore()
const { limit, sets, cardsSummaryWithStatusBySetId, fetchingAllSets, fetchingUserErrorMessages } = storeToRefs(setsStore)
limit.value = undefined

onMounted(() => {
  setsStore.loadSets()
})

// Search
const textSearch = ref<string>('')

const searchString = computed(() => textSearch.value.trim().toLowerCase())

const i18n = useI18n()

const getSearchableStringForSet = (set: SetDto) => SetDisplayInfo.create(set, i18n).combinedSearchableString

const filteredSets = computed(() => sets.value.filter((set) => getSearchableStringForSet(set).includes(searchString.value)))
</script>
