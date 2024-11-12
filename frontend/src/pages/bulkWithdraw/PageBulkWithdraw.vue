<template>
  <TheLayout login-banner>
    <CenterContainer>
      <BackLinkDeprecated />
      <HeadlineDefault
        level="h1"
        class="mt-10"
      >
        {{ $t('bulkWithdraw.headline') }}
      </HeadlineDefault>

      <ParagraphDefault class="my-3">
        <I18nT keypath="bulkWithdraw.setName">
          <template #setName>
            <strong>{{ settings.setName || $t('index.unnamedSetNameFallback') }}</strong>
          </template>
        </I18nT>
      </ParagraphDefault>

      <CardsSummaryContainer class="mb-4">
        <CardsSummary
          class="col-span-2"
          :loading="initializing"
          :cards-count="usableCards.length"
          :color="bulkWithdraw?.withdrawn ? 'green' : 'yellow'"
          :title="bulkWithdraw?.withdrawn ? $t('cards.status.labelBulkWithdrawn', 2) : $t('cards.status.labelFunded', 2)"
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

      <div v-else-if="bulkWithdrawPending">
        {{ $t('bulkWithdraw.withdrawPending') }}
      </div>

      <BulkWithdrawExists
        v-else-if="cardLockedByWithdraw != null"
        :restarting="resetting || initializing"
        @restart="restartBulkWithdraw"
      />

      <NoContent v-else-if="usableCards.length === 0 && !initializing" />

      <CardsList
        v-if="!initializing"
        class="w-full mt-6"
        :cards="usableCards"
      />
    </CenterContainer>
  </TheLayout>
</template>

<script lang="ts" setup>
import { computed, onBeforeMount, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import type { Card } from '@shared/data/trpc/Card'
import type { BulkWithdraw } from '@shared/data/trpc/BulkWithdraw'

import HeadlineDefault from '@/components/typography/HeadlineDefault.vue'
import ParagraphDefault from '@/components/typography/ParagraphDefault.vue'
import CardsSummary from '@/components/CardsSummaryDeprecated.vue'
import CardsSummaryContainer from '@/components/CardsSummaryDeprecatedContainer.vue'
import hashSha256 from '@/modules/hashSha256'
import useTRpc from '@/modules/useTRpc'
import useSetSettingsFromUrl from '@/modules/useSetSettingsFromUrl'
import useBacklink from '@/modules/useBackLink'

import BulkWithdrawQRCode from './components/BulkWithdrawQRCode.vue'
import BulkWithdrawExists from './components/BulkWithdrawExists.vue'
import CardsList from './components/CardsList.vue'
import RequestFailed from './components/RequestFailed.vue'
import NoContent from './components/NoContent.vue'
import TheLayout from '@/components/layout/TheLayout.vue'
import CenterContainer from '@/components/layout/CenterContainer.vue'
import BackLinkDeprecated from '@/components/BackLinkDeprecated.vue'

const route = useRoute()
const router = useRouter()

const trpc = useTRpc()
const { settings } = useSetSettingsFromUrl()

const requestFailed = ref(false)
const initializing = ref(true)

const setId = computed(() => route.params.setId == null || route.params.setId === '' ? undefined : String(route.params.setId))
const cards = ref<Card[]>([])

onBeforeMount(async () => {
  if (setId.value == null) {
    router.replace({ name: 'home', params: { lang: route.params.lang } })
    return
  }
  try {
    await initCardHashesForSet()
    await initBulkWithdraw()
  } catch (error: unknown) {
    console.error(error)
    requestFailed.value = true
  } finally {
    initializing.value = false
  }
})

/** @throws */
const initBulkWithdraw = async () => {
  await loadCards()
  await createIfPossible()
}

/** @throws */
const loadCards = async () => {
  cards.value = await Promise.all(cardHashes.value.map(
    async (cardHash) => trpc.card.getByHash.query({ hash: cardHash }),
  ))
}

const cardHashes = computed(() => {
  if (bulkWithdraw.value == null) {
    return cardHashesForSet.value
  }
  return cardHashesForBulkWithdraw.value
})

const cardHashesForSet = ref<string[]>([])
const initCardHashesForSet = async () => {
  cardHashesForSet.value = await Promise.all(
    [...new Array(settings.numberOfCards).keys()]
      .map(async (cardIndex) => await hashSha256(`${setId.value}/${cardIndex}`)),
  )
}

const cardHashesForBulkWithdraw = computed(() => bulkWithdraw.value?.cards || [])

const cardLockedByWithdraw = computed(() => cards.value?.find((card) => card.isLockedByBulkWithdraw && !card.withdrawn))

const bulkWithdrawPending = computed(() => cards.value?.find((card) => card.isLockedByBulkWithdraw && card.withdrawPending))

const resetting = ref(false)
const resetBulkWithdraw = async () => {
  resetting.value = true
  try {
    await resetBulkWithdrawFromId()
    goBack()
  } catch (error) {
    console.error(error)
    requestFailed.value = true
  } finally {
    resetting.value = false
  }
}

const { goBack } = useBacklink()

/** @throws */
const resetBulkWithdrawFromId = async () => {
  if (bulkWithdraw.value == null) {
    return
  }
  await trpc.bulkWithdraw.deleteById.mutate({ id: bulkWithdraw.value.id })
  await loadCards()
  bulkWithdraw.value = undefined
}

const restartBulkWithdraw = async () => {
  resetting.value = true
  try {
    await resetBulkWithdrawFromCard()
    initializing.value = true
    await initBulkWithdraw()
  } catch (error) {
    console.error(error)
    requestFailed.value = true
    return
  } finally {
    resetting.value = false
    initializing.value = false
  }
}

/** @throws */
const resetBulkWithdrawFromCard = async () => {
  if (cardLockedByWithdraw.value == null) {
    return
  }
  await trpc.bulkWithdraw.deleteByCardHash.mutate({ hash: cardLockedByWithdraw.value.hash })
  await loadCards()
}

const usableCards = computed(() => {
  if (bulkWithdraw.value == null) {
    return cards.value.filter((card) => card.funded != null && !isCardWithdrawn(card))
  }
  return cards.value.filter((card) => bulkWithdraw.value?.cards.includes(card.hash))
})

const isCardWithdrawn = (card: Card) => card.withdrawn != null || (card.withdrawPending && !card.isLockedByBulkWithdraw)

const fundedCardsTotalAmount = computed(() => usableCards.value.reduce((total, card) => total + (card.amount.funded || 0), 0))

const bulkWithdraw = ref<BulkWithdraw>()

/** @throws */
const createIfPossible = async () => {
  if (!isBulkWithdrawPossible.value) {
    return
  }
  await create()
}

const isBulkWithdrawPossible = computed(() =>
  !requestFailed.value
  && !bulkWithdrawPending.value
  && bulkWithdraw.value == null
  && cardLockedByWithdraw.value == null
  && usableCards.value.length > 0,
)

/** @throws */
const create = async () => {
  bulkWithdraw.value = await trpc.bulkWithdraw.createForCards.mutate(usableCards.value.map((card) => card.hash))
  await loadCards()
  setTimeout(pollBulkWithdrawAndCardsStatus, 5000)
}

const pollBulkWithdrawAndCardsStatus = async () => {
  if (bulkWithdraw.value == null) {
    return
  }
  try {
    bulkWithdraw.value = await trpc.bulkWithdraw.getById.query(bulkWithdraw.value.id)
    await loadCards()
  } catch (error: unknown) {
    console.error(error)
  } finally {
    setTimeout(pollBulkWithdrawAndCardsStatus, 5000)
  }
}
</script>
