<template>
  <div class="mt-3 mx-auto w-full max-w-md px-4">
    <ul class="mb-5">
      <li
        v-for="set in sets"
        :key="set.id"
        class="mb-2"
      >
        <h5 class="font-bold">
          Set {{ set.name }}
        </h5>
        <small class="block">({{ set.id }})</small>
        <p v-if="cardsBySet[set.id] == null || cardsBySet[set.id].length === 0">
          No cards in the set.
        </p>
        <template v-else>
          <h5>
            Cards:
          </h5>
          <ul>
            <li v-for="card in cardsBySet[set.id]" :key="card.hash">
              {{ card.hash }}
            </li>
          </ul>
        </template>
      </li>
    </ul>

    <ButtonDefault variant="outline" @click="safeReload">
      reload
    </ButtonDefault>
    <ButtonDefault @click="withdraw">
      withdraw
    </ButtonDefault>
  </div>
</template>

<script lang="ts" setup>
import { computed, onBeforeMount, ref, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type z from 'zod'

import type { Settings } from '@shared/data/redis/Set'

import type { Card } from '@backend/trpc/data/Card'
import type { Set } from '@backend/trpc/data/Set'

import ButtonDefault from '@/components/ButtonDefault.vue'
import hashSha256 from '@/modules/hashSha256'
import useTRpc from '@/modules/useTRpc'
import {
  getDefaultSettings,
  decodeCardsSetSettings,
} from '@/stores/cardsSets'

const route = useRoute()
const router = useRouter()

const { client } = useTRpc()

const setId = computed(() => route.params.setId == null || route.params.setId === '' ? undefined : String(route.params.setId))
const settings = reactive<Settings>(getDefaultSettings())
const cards = ref<Card[]>()

onBeforeMount(() => {
  if (setId.value == null) {
    router.replace({ name: 'home', params: { lang: route.params.lang } })
    return
  }
  loadSettingsFromUrl()
  loadCards()
})

const loadSettingsFromUrl = () => {
  const settingsEncoded = String(route.params.settings)
  try {
    Object.assign(settings, decodeCardsSetSettings(settingsEncoded))
  } catch (e) {
    // do nothing
  }
}

const loadCards = async () => {
  cards.value = await Promise.all([...new Array(settings.numberOfCards).keys()].map(
    async (cardIndex) => client.card.getByHash.query(await hashSha256(`${setId.value}/${cardIndex}`)),
  ))
}

// todo : if there is an active bulk withdraw for a card show info to user (with a reset button)
// todo : if there are no funded cards show info to user (with a back button)
// todo : show the list of cards that are funded (like status list on PageCards) + button for withdraw creation
// todo : on withdraw creaton show withdraw link
// todo : handle loading states
// todo : handle errors

type SetId = z.infer<typeof Set.shape.id>

const sets = ref<Set[]>([])
const cardsBySet = ref<Record<SetId, Card[]>>({})

const reload = async () => {
  sets.value = await client.set.getAll.query()

  cardsBySet.value = (await Promise.all(sets.value.map(async (set) => {
    const cards = await client.set.getCards.query(set.id)
    return { set, cards }
  }))).reduce((total, { set, cards }) => ({
    ...total,
    [set.id]: cards,
  }), {} as Record<SetId, Card[]>)
}

const safeReload = async () => {
  try {
    await reload()
  } catch (error) {
    // todo : add error handling (i.e. show error to user)
    console.error(error)
  }
}

onBeforeMount(safeReload)

type CardHash = z.infer<typeof Card.shape.hash>
const withdraw = async () => {
  client.bulkWithdraw.createForCards.mutate(
    Object.values(cardsBySet.value).reduce((cardHashes, cards) => [
      ...cardHashes,
      ...cards.map((card) => card.hash),
    ], [] as CardHash[]),
  )
}
</script>
