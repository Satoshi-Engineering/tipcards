<template>
  hello world
</template>

<script lang="ts" setup>
import { onBeforeMount } from 'vue'
import type z from 'zod'

import useTRpc from '@/modules/useTRpc'

import type { Card } from '@backend/trpc/data/Card'
import type { Set } from '@backend/trpc/data/Set'

const { client } = useTRpc()

type SetId = z.infer<typeof Set.shape.id>

onBeforeMount(async () => {
  const sets = await client.set.getAll.query()
  const cardsBySet = (await Promise.all(sets.map(async (set) => {
    const cards = await client.set.getCards.query(set.id)
    return { set, cards }
  }))).reduce((total, { set, cards }) => ({
    ...total,
    [set.id]: cards,
  }), {} as Record<SetId, Card[]>)

  console.error(cardsBySet)
})
</script>
