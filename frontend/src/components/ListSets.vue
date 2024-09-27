<template>
  <section class="flow-root shadow-default rounded-default">
    <header class="text-sm border-b border-white-50 py-4 px-5">
      {{ $t('sets.setInfo') }}
    </header>
    <ul>
      <li
        v-for="set in sortedSavedSets"
        :key="set.id"
        class="mx-5 border-b last:border-0 border-white-50 group"
      >
        <LinkDefault
          class="grid grid-cols-[1fr,4.5rem] -mx-5 px-5 py-4 group-last:pb-6 group-last:rounded-b-default hover:bg-grey-light"
          no-underline
          no-bold
          :to="{
            name: 'cards',
            params: {
              setId: set.id,
              settings: encodeCardsSetSettings(set.settings),
              lang: $route.params.lang,
            }
          }"
        >
          <HeadlineDefault level="h4" class="col-start-1 col-span-2">
            <template v-if="typeof set.settings.name === 'string' && set.settings.name !== ''">
              {{ set.settings.name }}
            </template>
            <template v-else>{{ $t('sets.unnamedSetNameFallback') }}</template>
          </HeadlineDefault>
          <div class="col-start-1 text-sm">
            <IconTipCardSet class="inline-block align-middle me-2 w-auto h-5 text-yellow" />
            <span class="align-middle">
              {{ $t('general.cards', { count: set.settings.numberOfCards }) }}
            </span>
          </div>
          <div class="col-start-1">
            <time class="text-sm">
              {{ $d(set.created, {
                year: 'numeric', month: 'numeric', day: 'numeric',
                hour: 'numeric', minute: 'numeric'
              }) }}
            </time>
          </div>
          <div
            v-if="set.cardsStatus != null"
            class="col-start-2 row-start-2 row-span-2 mb-1 place-self-end grid grid-cols-[repeat(6,8px)] grid-rows-[repeat(2,8px)] gap-[2px]"
          >
            <div
              v-for="n in Math.min(12, set.settings.numberOfCards)"
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
import type { SetDto } from '@shared/data/trpc/tipcards/SetDto'
import { computed, type PropType } from 'vue'
import LinkDefault from './typography/LinkDefault.vue'
import HeadlineDefault from './typography/HeadlineDefault.vue'
import IconTipCardSet from './icons/IconTipCardSet.vue'
import useSets from '@/modules/useSets'

const { encodeCardsSetSettings } = useSets()

const props = defineProps({
  sets: {
    type: Array as PropType<SetDto[]>,
    required: true,
  },
})

const sortedSavedSets = computed(() => {
  return [...props.sets]
    .map((set) => ({
      ...set,
      cardsStatus: null, // Implement this later
    }))
    .sort((a, b) => {
      const nameA = a.settings.name?.toLowerCase()
      const nameB = b.settings.name?.toLowerCase()
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
