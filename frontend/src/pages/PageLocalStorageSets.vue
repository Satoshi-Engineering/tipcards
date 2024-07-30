<template>
  <TheLayout>
    <CenterContainer class="flex flex-col">
      <HeadlineDefault level="h3" class="text-center">
        {{ t('localStorageDeprecation.setsPage.headline') }}
      </HeadlineDefault>
      <ParagraphDefault>
        {{ t('localStorageDeprecation.setsPage.text') }}
      </ParagraphDefault>
      <ParagraphDefault class="mb-6">
        {{ t('localStorageDeprecation.setsPage.explanation') }}
      </ParagraphDefault>
      <div
        v-if="sets.length < 1"
        class="flex flex-col items-center text-sm text-grey"
      >
        <ParagraphDefault>
          {{ t('localStorageDeprecation.setsPage.noSets') }}
        </ParagraphDefault>
        <ButtonDefault
          :to="{ name: 'home', params: { lang: $route.params.lang } }"
          variant="secondary"
        >
          {{ t('localStorageDeprecation.setsPage.buttonBack') }}
        </ButtonDefault>
      </div>
      <div v-else class="flex flex-col items-center">
        <ul class="mb-8">
          <li
            v-for="cardsSet in sortedSavedCardsSets"
            :key="cardsSet.setId"
            class="leading-tight my-2"
          >
            <LinkDefault
              class="no-underline group"
              :bold="false"
              :to="{
                name: 'cards',
                params: {
                  setId: cardsSet.setId,
                  settings: encodeCardsSetSettings(cardsSet.settings),
                  lang: $route.params.lang,
                }
              }"
            >
              <small>
                {{ d(cardsSet.date, {
                  year: 'numeric', month: 'numeric', day: 'numeric',
                  hour: 'numeric', minute: 'numeric'
                }) }}
                -
                {{ t('general.cards', { count: cardsSet.settings.numberOfCards }) }}
              </small>
              <br>
              <span
                v-if="typeof cardsSet.settings.setName === 'string' && cardsSet.settings.setName !== ''"
                class="underline group-hover:no-underline"
              >
                {{ cardsSet.settings.setName }}
              </span>
              <span
                v-else
                class="underline group-hover:no-underline italic text-grey"
              >
                {{ t('index.unnamedSetNameFallback') }}
              </span>
            </LinkDefault>
          </li>
        </ul>
        <ButtonDefault @click="confirmAndDeleteAllSets">
          {{ t('localStorageDeprecation.setsPage.buttonClearAll') }}
        </ButtonDefault>
      </div>
    </CenterContainer>
  </TheLayout>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import CenterContainer from '@/components/layout/CenterContainer.vue'
import TheLayout from '@/components/layout/TheLayout.vue'
import HeadlineDefault from '@/components/typography/HeadlineDefault.vue'
import LinkDefault from '@/components/typography/LinkDefault.vue'
import useLocalStorageSets from '@/modules/useLocalStorageSets'
import { getDefaultSettings, encodeCardsSetSettings } from '@/stores/cardsSets'
import ParagraphDefault from '@/components/typography/ParagraphDefault.vue'
import ButtonDefault from '@/components/buttons/ButtonDefault.vue'

const { d, t } = useI18n()
const { sets, deleteAllSets } = useLocalStorageSets()

const sortedSavedCardsSets = computed(() => [...sets.value]
  .map((set) => {
    let date = new Date().toISOString()
    if (set.date != null) {
      date = new Date(set.date * 1000).toISOString()
    }
    let settings = getDefaultSettings()
    if (set.settings != null) {
      settings = set.settings
    }
    return {
      setId: set.id,
      date,
      settings,
    }
  })
  .sort((a, b) => {
    const nameA = a.settings.setName?.toLowerCase()
    const nameB = b.settings.setName?.toLowerCase()
    if (nameA == null || nameA === '') {
      return 1
    }
    if (nameB == null || nameB === '') {
      return -1
    }
    return nameA.localeCompare(nameB)
  }),
)

const confirmAndDeleteAllSets = () => {
  if (confirm(t('localStorageDeprecation.setsPage.confirmClearAll'))) {
    deleteAllSets()
  }
}
</script>
