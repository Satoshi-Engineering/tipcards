<template>
  <div class="mt-3 mx-auto w-full max-w-md px-4">
    <HeadlineDefault
      level="h1"
      class="mt-10"
    >
      {{ $t('bulkWithdraw.headline') }}
    </HeadlineDefault>

    <p class="my-3">
      <Translation keypath="bulkWithdraw.setName">
        <template #setName>
          <strong>{{ settings.setName || $t('index.unnamedSetNameFallback') }}</strong>
        </template>
      </Translation>
    </p>

    <CardsSummaryContainer class="mb-4">
      <CardsSummary
        :loading="initializing"
        :cards-count="fundedCards?.length || 0"
        :title="$t('cards.status.labelFunded', 2)"
        :sats="fundedCardsTotalAmount"
      />
    </CardsSummaryContainer>

    <RequestFailed v-if="requestFailed" />

    <BulkWithdrawQRCode
      v-else-if="bulkWithdraw != null"
      :bulk-withdraw="bulkWithdraw"
      :resetting="resetting"
      @reset="resetBulkWithdraw"
    />

    <BulkWithdrawExists
      v-else-if="cardLockedByWithdraw != null"
      :resetting="resetting"
      @reset="resetBulkWithdraw"
    />

    <NoContent v-else-if="fundedCards?.length === 0" />

    <CreateBulkWithdraw
      v-else-if="fundedCards != null"
      :creating="creating"
      @create="create"
    />

    <CardsList
      class="w-full mt-6"
      :funded-cards="fundedCards || []"
    />
  </div>
</template>

<script lang="ts" setup>
import { computed, onBeforeMount, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import type { Card } from '@backend/trpc/data/Card'
import type { BulkWithdraw } from '@backend/trpc/data/BulkWithdraw'

import HeadlineDefault from '@/components/typography/HeadlineDefault.vue'
import CardsSummary from '@/components/CardsSummary.vue'
import CardsSummaryContainer from '@/components/CardsSummaryContainer.vue'
import Translation from '@/modules/I18nT'
import hashSha256 from '@/modules/hashSha256'
import useTRpc from '@/modules/useTRpc'
import useSetSettingsFromUrl from '@/modules/useSetSettingsFromUrl'

import BulkWithdrawQRCode from './components/BulkWithdrawQRCode.vue'
import BulkWithdrawExists from './components/BulkWithdrawExists.vue'
import CardsList from './components/CardsList.vue'
import CreateBulkWithdraw from './components/CreateBulkWithdraw.vue'
import RequestFailed from './components/RequestFailed.vue'
import NoContent from './components/NoContent.vue'

const route = useRoute()
const router = useRouter()

const { client } = useTRpc()
const { settings } = useSetSettingsFromUrl()

const requestFailed = ref(false)
const initializing = ref(true)

const setId = computed(() => route.params.setId == null || route.params.setId === '' ? undefined : String(route.params.setId))
const cards = ref<Card[]>()

onBeforeMount(() => {
  if (setId.value == null) {
    router.replace({ name: 'home', params: { lang: route.params.lang } })
    return
  }
  loadCards()
})

const loadCards = async () => {
  try {
    cards.value = await Promise.all([...new Array(settings.numberOfCards).keys()].map(
      async (cardIndex) => client.card.getByHash.query(await hashSha256(`${setId.value}/${cardIndex}`)),
    ))
  } catch (error) {
    console.error(error)
    requestFailed.value = true
  }
    initializing.value = false
}

const cardLockedByWithdraw = computed(() => cards.value?.find((card) => card.isLockedByBulkWithdraw && !card.withdrawn))

const resetting = ref(false)
const resetBulkWithdraw = async () => {
  resetting.value = true
  try {
    await resetBulkWithdrawFromId()
    await resetBulkWithdrawFromCard()
  } catch (error) {
    console.error(error)
    requestFailed.value = true
  }
  resetting.value = false
}

const resetBulkWithdrawFromId = async () => {
  if (bulkWithdraw.value == null) {
    return
  }
  await client.bulkWithdraw.deleteById.mutate(bulkWithdraw.value.id)
  await loadCards()
  bulkWithdraw.value = undefined
}

const resetBulkWithdrawFromCard = async () => {
  if (cardLockedByWithdraw.value == null) {
    return
  }
  await client.bulkWithdraw.deleteByCardHash.mutate(cardLockedByWithdraw.value.hash)
  await loadCards()
}

const fundedCards = computed(() => cards.value?.filter((card) => 
  card.funded != null
  && !card.withdrawPending
  && card.withdrawn == null,
))

const fundedCardsTotalAmount = computed(() => {
  if (fundedCards.value == null) {
    return 0
  }
  return fundedCards.value.reduce((total, card) => total + (card.amount.funded || 0), 0)
})

const creating = ref(false)
const bulkWithdraw = ref<BulkWithdraw>()
const create = async () => {
  if (fundedCards.value == null) {
    return
  }
  creating.value = true
  try {
    bulkWithdraw.value = await client.bulkWithdraw.createForCards.mutate(fundedCards.value.map((card) => card.hash))
    await loadCards()
  } catch (error) {
    console.error(error)
    requestFailed.value = true
  }
  creating.value = false
  setTimeout(updateBulkWithdraw, 5000)
}

const updateBulkWithdraw = async () => {
  if (bulkWithdraw.value == null) {
    return
  }
  setTimeout(updateBulkWithdraw, 5000)
  bulkWithdraw.value = await client.bulkWithdraw.getById.query(bulkWithdraw.value.id)
}
</script>
