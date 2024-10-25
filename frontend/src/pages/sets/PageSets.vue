<template>
  <TheLayout login-banner>
    <CenterContainer class="mb-10">
      <BackLink :to="{ name: 'home', params: { lang: $route.params.lang }}">
        {{ t('sets.backLink') }}
      </BackLink>
      <div class="flex justify-between">
        <HeadlineDefault
          level="h1"
          styling="h2"
          data-test="headline"
        >
          {{ t('sets.title') }}
        </HeadlineDefault>
        <ButtonIcon
          icon="plus"
          size="small"
          variant="yellow"
          class="-mt-5"
          data-test="button-new-set"
          :to="{ name: 'cards', params: { lang: $route.params.lang } }"
        >
          {{ t('sets.newSet') }}
        </ButtonIcon>
      </div>
      <div v-if="!isLoggedIn" data-test="please-login-section">
        <ParagraphDefault>
          {{ t('sets.loginToSeeYourSets') }}
        </ParagraphDefault>
        <LinkDefault @click="showModalLogin = true">
          {{ t('general.login') }}
        </LinkDefault>
      </div>
      <div
        v-if="isLoggedIn"
        class="flex flex-col"
        data-test="logged-in"
      >
        <SetsListFilterSection
          class="my-8"
          @text-search="textSearch = $event"
        />
        <UserErrorMessages
          v-if="fetchingUserErrorMessages.length > 0"
          :user-error-messages="fetchingUserErrorMessages"
        />
        <ParagraphDefault
          v-else-if="!fetchingAllSets && sets.length < 1"
          data-test="sets-list-empty"
        >
          {{ t('sets.noSavedCardsSetsMessage') }}
        </ParagraphDefault>
        <div v-else data-test="sets-list-with-data">
          <ParagraphDefault>
            {{ t('sets.description') }}
          </ParagraphDefault>
          <SetsListFilterSection
            class="my-8"
            @text-search="textSearch = $event"
          />
          <div class="text-sm">
            {{
              fetchingAllSets
                ? '&nbsp;'
                : t('sets.displayedSetsOfTotalSets', { displayedSets: filteredSets.length, totalSets: sets.length })
            }}
          </div>
          <SetsList
            :sets="filteredSets"
            :cards-info-by-set-id="cardsInfoBySetId"
            :fetching="fetchingAllSets"
            :message="sets.length > 0 && filteredSets.length === 0 ? $t('sets.noSetsMatchingFilter') : undefined"
            class="my-7"
          />
        </div>
      </div>
      <SetsInLocalStorageWarning class="mt-8" />
    </CenterContainer>
  </TheLayout>
</template>

<script setup lang="ts">
import { computed, nextTick, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { storeToRefs } from 'pinia'
import debounce from 'lodash.debounce'

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

import { useAuthStore } from '@/stores/auth'
import { useModalLoginStore } from '@/stores/modalLogin'
import useSets, { type SetCardsInfoBySetId } from '@/modules/useSets'
import { watch } from 'vue'
import type { SetDto } from '@shared/data/trpc/SetDto'
import type { SetCardsInfoDto } from '@shared/data/trpc/SetCardsInfoDto'
import { dateWithTimeFormat } from '@/utils/dateFormats'

const { t } = useI18n()
const { isLoggedIn } = storeToRefs(useAuthStore())
const modalLoginStore = useModalLoginStore()

const { showModalLogin } = storeToRefs(modalLoginStore)

const { getAllSets, getCardsInfoForSet, fetchingAllSets, fetchingUserErrorMessages } = useSets()

const sets = ref<SetDto[]>([])

const cardsInfoWithLoadingStatusBySetId = ref<Record<SetDto['id'], { cardsInfo: SetCardsInfoDto | null, startedLoading: boolean }>>({})

const cardsInfoBySetId = computed<SetCardsInfoBySetId>(() => {
  const result: SetCardsInfoBySetId = {}
  for (const [setId, { cardsInfo }] of Object.entries(cardsInfoWithLoadingStatusBySetId.value)) {
    if (cardsInfo === undefined) {
      continue
    }
    result[setId] = cardsInfo
  }
  return result
})

const updateCardsInfoForSetsInViewport = async () => {
  const setsSortedByNumberOfCards = getSetsSortedByNumberOfCardsDesc()
  for (const set of setsSortedByNumberOfCards) {
    if (!isSetInViewport(set.id)) {
      continue
    }
    if (cardsInfoWithLoadingStatusBySetId.value[set.id]?.startedLoading === true) {
      continue
    }
    setStartedLoadingForSet(set.id)
    const cardsInfo = await getCardsInfoForSet(set.id)
    setCardsInfoForSet(set.id, cardsInfo)
  }
}

const debouncedUpdateCardsInfoForSetsInViewport = debounce(updateCardsInfoForSetsInViewport, 1000)

const startListeningForScroll = () => {
  window.addEventListener('scroll', debouncedUpdateCardsInfoForSetsInViewport)
  window.addEventListener('resize', debouncedUpdateCardsInfoForSetsInViewport)
}

const stopListeningForScroll = () => {
  window.removeEventListener('scroll', debouncedUpdateCardsInfoForSetsInViewport)
  window.removeEventListener('resize', debouncedUpdateCardsInfoForSetsInViewport)
}

const loadAllSets = async () => {
  sets.value = await getAllSets()
}

const resetSetsAndCardsInfo = () => {
  sets.value = []
  cardsInfoWithLoadingStatusBySetId.value = {}
}

const getSetsSortedByNumberOfCardsDesc = () => [...sets.value].sort((a, b) => a.settings.numberOfCards - b.settings.numberOfCards)

watch(isLoggedIn, async (isLoggedIn) => {
  if (!isLoggedIn) {
    resetSetsAndCardsInfo()
    stopListeningForScroll()
    return
  }

  await loadAllSets()
  await nextTick()
  updateCardsInfoForSetsInViewport()
  startListeningForScroll()
}, { immediate: true })

const isSetInViewport = (id: string) => {
  const element = document.querySelector(`[data-set-id="${id}"]`)
  if (!element) {
    return false
  }

  const rect = element.getBoundingClientRect()
  return rect.top < window.innerHeight && rect.bottom > 0
}

const setStartedLoadingForSet = (setId: string) => {
  cardsInfoWithLoadingStatusBySetId.value = {
    ...cardsInfoWithLoadingStatusBySetId.value,
    [setId]: {
      ...cardsInfoWithLoadingStatusBySetId.value[setId],
      startedLoading: true,
    },
  }
}

const setCardsInfoForSet = (setId: string, cardsInfo: SetCardsInfoDto | null) => {
  cardsInfoWithLoadingStatusBySetId.value = {
    ...cardsInfoWithLoadingStatusBySetId.value,
    [setId]: {
      ...cardsInfoWithLoadingStatusBySetId.value[setId],
      cardsInfo,
    },
  }
}


// Search
const textSearch = ref<string>('')

const filteredSets = computed(() => sets.value.filter((set) => getSearchString(set).toLowerCase().includes(textSearch.value.trim().toLowerCase())))

const { d } = useI18n()

const getSearchString = (set: SetDto) =>
  `${set.settings.name || t('sets.unnamedSetNameFallback')} ${d(set.created, dateWithTimeFormat)} ${set.settings.numberOfCards}`
</script>
