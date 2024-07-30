<template>
  <TheLayout>
    <CenterContainer class="mb-10">
      <div class="flex justify-between">
        <HeadlineDefault level="h1">
          {{ t('sets.title') }}
        </HeadlineDefault>
        <LinkDefault class="-mt-4" @click="$router.push({ name: 'cards', params: { lang: $route.params.lang } })">
          <IconPlus class="w-8 h-8 inline" />
          {{ t('sets.newSet') }}
        </LinkDefault>
      </div>
      <ParagraphDefault v-if="!isLoggedIn">
        Your are not logged in. Please
        <LinkDefault @click="showModalLogin = true">
          {{ $t('general.login') }}
        </LinkDefault>
        to list your sets!
      </ParagraphDefault>
      <div v-if="isLoggedIn" class="flex flex-col">
        <UserErrorMessages :user-error-messages="fetchingUserErrorMessages" />
        <ParagraphDefault v-if="sets.length < 1">
          {{ t('sets.noSavedCardsSetsMessage') }}
        </ParagraphDefault>
        <div v-else>
          <ParagraphDefault>
            {{ t('sets.description') }}
          </ParagraphDefault>
          <ul
            class="mx-auto"
          >
            <li
              v-for="cardsSet in sortedSavedCardsSets"
              :key="cardsSet.setId"
              class="leading-tight my-2 text-center"
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
                  {{ t('sets.unnamedSetNameFallback') }}
                </span>
              </LinkDefault>
            </li>
          </ul>
        </div>
      </div>
    </CenterContainer>
  </TheLayout>
</template>

<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { storeToRefs } from 'pinia'

import TheLayout from '@/components/layout/TheLayout.vue'
import CenterContainer from '@/components/layout/CenterContainer.vue'
import HeadlineDefault from '@/components/typography/HeadlineDefault.vue'
import ParagraphDefault from '@/components/typography/ParagraphDefault.vue'
import LinkDefault from '@/components/typography/LinkDefault.vue'
import IconPlus from '@/components/icons/IconPlus.vue'

import { useAuthStore } from '@/stores/auth'
import { useModalLoginStore } from '@/stores/modalLogin'
import { encodeCardsSetSettings, getDefaultSettings, useCardsSetsStore } from '@/stores/cardsSets'

const { t, d } = useI18n()
const { isLoggedIn } = storeToRefs(useAuthStore())
const modalLoginStore = useModalLoginStore()
const { showModalLogin } = storeToRefs(modalLoginStore)

const cardsStore = useCardsSetsStore()
const { subscribe } = cardsStore
const { sets, hasSetsInLocalStorage, fetchingUserErrorMessages } = storeToRefs(cardsStore)

const sortedSavedCardsSets = computed(() => {
  return [...sets.value]
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
    })
})

onMounted(async () => {
  await subscribe()

  const originMapping: Record<string, string> = {
    'https://tipcards.sate.tools': 'https://tipcards.io',
    'https://dev.tipcards.sate.tools': 'https://dev.tipcards.io',
  }
  if (
    !hasSetsInLocalStorage.value
    && typeof originMapping[location.origin] === 'string'
  ) {
    location.href = `${originMapping[location.origin]}${location.pathname}${location.search}${location.hash}`
  }
})

</script>
