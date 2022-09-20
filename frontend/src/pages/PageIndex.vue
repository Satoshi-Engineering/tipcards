<template>
  <div class="grid place-items-center text-center min-h-screen">
    <div>
      <div class="text-6xl">
        ⚡
      </div>
      <HeadlineDefault level="h1">
        Lightning Tip Cards
      </HeadlineDefault>
      <p>by <a href="https://satoshiengineering.com" target="_blank">Satoshi Engineering</a></p>
      <p class="mt-4">
        <ButtonDefault @click="$router.push({ name: 'cards' })">
          {{ t('index.buttonCreate') }}
        </ButtonDefault>
      </p>
      <div class="mt-24">
        <HeadlineDefault level="h4">
          {{ t('index.savedCardsSetsHeadline') }}
        </HeadlineDefault>
        <div class="flex">
          <div
            v-if="savedCardsSets.length < 1"
            class="mx-auto text-sm text-gray-400"
          >
            {{ t('index.noSavedCardsSetsMessage') }}
          </div>
          <ul
            v-else
            class="mx-auto"
          >
            <li
              v-for="cardsSet in [...savedCardsSets].reverse()"
              :key="cardsSet.setId"
              class="text-left"
            >
              <LinkDefault
                :bold="false"
                :to="{
                  name: 'cards',
                  params: {
                    setId: cardsSet.setId,
                    settings: cardsSet.settings,
                  }
                }"
              >
                {{ d(cardsSet.date, {
                  year: 'numeric', month: 'numeric', day: 'numeric',
                  hour: 'numeric', minute: 'numeric'
                }) }}
                -
                {{ t('general.cards', { count: decodeCardsSetSettings(cardsSet.settings).numberOfCards }) }}
              </LinkDefault>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onBeforeMount } from 'vue'
import { useI18n } from 'vue-i18n'

import HeadlineDefault from '@/components/typography/HeadlineDefault.vue'
import LinkDefault from '@/components/typography/LinkDefault.vue'
import ButtonDefault from '@/components/ButtonDefault.vue'
import { savedCardsSets, loadSavedCardsSets, decodeCardsSetSettings } from '@/modules/cardsSets'

const { t, d } = useI18n()

onBeforeMount(loadSavedCardsSets)
</script>
