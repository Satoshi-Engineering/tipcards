<template>
  <section class="flow-root shadow-default rounded-default">
    <header class="text-sm border-b border-white-50 py-4 px-5">
      {{ $t('sets.setInfo') }}
    </header>
    <ul>
      <li
        v-for="cardsSet in sortedSavedCardsSets"
        :key="cardsSet.setId"
        class="mx-5 border-b last:border-0 border-white-50 group"
      >
        <LinkDefault
          class="grid grid-cols-[1fr,4.5rem] -mx-5 px-5 py-4 group-last:pb-6 group-last:rounded-b-default hover:bg-grey-light"
          no-underline
          no-bold
          :to="{
            name: 'cards',
            params: {
              setId: cardsSet.setId,
              settings: encodeCardsSetSettings(cardsSet.settings),
              lang: $route.params.lang,
            }
          }"
        >
          <HeadlineDefault level="h4" class="col-start-1 col-span-2">
            <template v-if="typeof cardsSet.settings.setName === 'string' && cardsSet.settings.setName !== ''">
              {{ cardsSet.settings.setName }}
            </template>
            <template v-else>{{ $t('sets.unnamedSetNameFallback') }}</template>
          </HeadlineDefault>
          <div class="col-start-1 text-sm">
            <IconTipCardSet class="inline-block align-middle me-2 w-auto h-5 text-yellow" />
            <span class="align-middle">
              {{ $t('general.cards', { count: cardsSet.settings.numberOfCards }) }}
            </span>
          </div>
          <div class="col-start-1">
            <time class="text-sm">
              {{ $d(cardsSet.date, {
                year: 'numeric', month: 'numeric', day: 'numeric',
                hour: 'numeric', minute: 'numeric'
              }) }}
            </time>
          </div>
          <div class="col-start-2 row-start-2 row-span-2 mb-1 place-self-end grid grid-cols-[repeat(6,8px)] grid-rows-[repeat(2,8px)] gap-[2px]">
            <div
              v-for="n in Math.min(12, cardsSet.settings.numberOfCards)"
              :key="n"
              class="w-full h-full bg-white border-2 border-white-50"
            />
          </div>
        </LinkDefault>
      </li>
    </ul>
  </section>
</template>

<script setup lang="ts">
import { encodeCardsSetSettings, getDefaultSettings } from '@/stores/cardsSets'
import type { Set } from '@backend/database/deprecated/data/Set'
import { computed, type PropType } from 'vue'
import LinkDefault from './typography/LinkDefault.vue'
import HeadlineDefault from './typography/HeadlineDefault.vue'
import IconTipCardSet from './icons/IconTipCardSet.vue'

const props = defineProps({
  sets: {
    type: Array as PropType<Set[]>,
    required: true,
  },
})

const sortedSavedCardsSets = computed(() => {
  return [...props.sets]
    .map((set) => {
      let date = new Date()
      if (set.date != null) {
        date = new Date(set.date * 1000)
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
</script>
