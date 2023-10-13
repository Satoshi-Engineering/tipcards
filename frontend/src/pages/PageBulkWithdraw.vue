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
import { onBeforeMount, ref } from 'vue'
import type z from 'zod'

import type { Card } from '@backend/trpc/data/Card'
import type { Set } from '@backend/trpc/data/Set'

import ButtonDefault from '@/components/ButtonDefault.vue'
import useTRpc from '@/modules/useTRpc'

const { client } = useTRpc()

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
