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
      <div
        v-if="t('index.youtube.create.link').length > 0 && t('index.youtube.use.link').length > 0"
        class="mt-24"
      >
        <div class="flex flex-col md:flex-row">
          <div class="mb-5 md:mb-0 md:mr-5">
            <HeadlineDefault level="h4">
              {{ t('index.youtube.create.label') }}
            </HeadlineDefault>
            <a
              class="flex items-center justify-center [width:356px] [height:200px] bg-[url('/src/assets/images/create-tipcards.webp')] bg-cover bg-center bg-no-repeat"
              :href="t('index.youtube.create.link')"
              target="_blank"
            >
              <svg
                version="1.1"
                viewBox="0 0 68 48"
                height="48"
                width="68"
              >
                <path d="M66.52,7.74c-0.78-2.93-2.49-5.41-5.42-6.19C55.79,.13,34,0,34,0S12.21,.13,6.9,1.55 C3.97,2.33,2.27,4.81,1.48,7.74C0.06,13.05,0,24,0,24s0.06,10.95,1.48,16.26c0.78,2.93,2.49,5.41,5.42,6.19 C12.21,47.87,34,48,34,48s21.79-0.13,27.1-1.55c2.93-0.78,4.64-3.26,5.42-6.19C67.94,34.95,68,24,68,24S67.94,13.05,66.52,7.74z" fill="#f00"></path>
                <path d="M 45,24 27,14 27,34" fill="#fff"></path>
              </svg>
            </a>
          </div>
          <div>
            <HeadlineDefault level="h4">
              {{ t('index.youtube.use.label') }}
            </HeadlineDefault>
            <a
              class="flex items-center justify-center [width:356px] [height:200px] bg-[url('/src/assets/images/use-tipcards.webp')] bg-cover bg-center bg-no-repeat"
              :href="t('index.youtube.use.link')"
              target="_blank"
            >
              <svg
                version="1.1"
                viewBox="0 0 68 48"
                height="48"
                width="68"
              >
                <path d="M66.52,7.74c-0.78-2.93-2.49-5.41-5.42-6.19C55.79,.13,34,0,34,0S12.21,.13,6.9,1.55 C3.97,2.33,2.27,4.81,1.48,7.74C0.06,13.05,0,24,0,24s0.06,10.95,1.48,16.26c0.78,2.93,2.49,5.41,5.42,6.19 C12.21,47.87,34,48,34,48s21.79-0.13,27.1-1.55c2.93-0.78,4.64-3.26,5.42-6.19C67.94,34.95,68,24,68,24S67.94,13.05,66.52,7.74z" fill="#f00"></path>
                <path d="M 45,24 27,14 27,34" fill="#fff"></path>
              </svg>
            </a>
          </div>
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
