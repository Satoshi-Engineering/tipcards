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
          <SetsList
            :sets="filteredSets"
            :statistics="statistics"
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
import useSets, { type SetStatisticsBySetId } from '@/modules/useSets'
import { watch } from 'vue'
import type { SetDto } from '@shared/data/trpc/tipcards/SetDto'
import type { SetStatisticsDto } from '@shared/data/trpc/tipcards/SetStatisticsDto'

const { t } = useI18n()
const { isLoggedIn } = storeToRefs(useAuthStore())
const modalLoginStore = useModalLoginStore()

const { showModalLogin } = storeToRefs(modalLoginStore)

const { getAllSets, getStatisticsForSet, fetchingAllSets, fetchingUserErrorMessages } = useSets()

const sets = ref<SetDto[]>([])

const statisticsWithLoadingInfo = ref<Record<SetDto['id'], { statistics: SetStatisticsDto | null, startedLoading: boolean }>>({})

const statistics = computed<SetStatisticsBySetId>(() => {
  const result: SetStatisticsBySetId = {}
  for (const [setId, { statistics }] of Object.entries(statisticsWithLoadingInfo.value)) {
    if (statistics === undefined) {
      continue
    }
    result[setId] = statistics
  }
  return result
})

const debouncedUpdateSetsStatistics = debounce(updateSetStatisticsForSetsInViewport, 1000)

watch(isLoggedIn, async (isLoggedIn) => {
  if (!isLoggedIn) {
    sets.value = []
    statisticsWithLoadingInfo.value = {}
    stopListeningForScroll()
    return
  }

  sets.value = await getAllSets()

  await nextTick()
  updateSetStatisticsForSetsInViewport()
  startListeningForScroll()
}, { immediate: true })

const textSearch = ref<string>('')
const filteredSets = computed(() => {
  if (!textSearch.value) {
    return sets.value
  }

  return sets.value.filter((set) => set.settings.name.toLowerCase().includes(textSearch.value.toLowerCase()))
})

async function updateSetStatisticsForSetsInViewport() {
  const setsSortedByNumberOfCards = [...sets.value].sort((a, b) => a.settings.numberOfCards - b.settings.numberOfCards)
  for (const set of setsSortedByNumberOfCards) {
    if (!setIsInViewport(set.id)) {
      continue
    }
    if (statisticsWithLoadingInfo.value[set.id]?.startedLoading === true) {
      continue
    }
    statisticsWithLoadingInfo.value = {
      ...statisticsWithLoadingInfo.value,
      [set.id]: {
        ...statisticsWithLoadingInfo.value[set.id],
        startedLoading: true,
      },
    }
    statisticsWithLoadingInfo.value = {
      ...statisticsWithLoadingInfo.value,
      [set.id]: {
        ...statisticsWithLoadingInfo.value[set.id],
        statistics: await getStatisticsForSet(set.id),
      },
    }
  }
}

function startListeningForScroll() {
  window.addEventListener('scroll', debouncedUpdateSetsStatistics)
  window.addEventListener('resize', debouncedUpdateSetsStatistics)
}

function stopListeningForScroll() {
  window.removeEventListener('scroll', debouncedUpdateSetsStatistics)
  window.removeEventListener('resize', debouncedUpdateSetsStatistics)
}

const setIsInViewport = (id: string) => {
  const element = document.querySelector(`[data-set-id="${id}"]`)
  if (!element) {
    return false
  }

  const rect = element.getBoundingClientRect()
  return rect.top < window.innerHeight && rect.bottom > 0
}
</script>
