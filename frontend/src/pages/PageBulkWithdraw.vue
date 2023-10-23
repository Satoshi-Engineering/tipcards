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

    <div v-if="requestFailed">
      <p class="text-red-500 mb-2">
        {{ $t('bulkWithdraw.genericErrorMessage') }}
      </p>
      <LinkDefault
        variant="no-border"
        @click="reload()"
      >
        {{ $t('bulkWithdraw.reload') }}
      </LinkDefault>
    </div>

    <div v-else-if="cardLockedByWithdraw != null">
      <p class="mb-4">
        {{ $t('bulkWithdraw.withdrawExists') }}
      </p>
      <ButtonWithTooltip
        type="submit"
        variant="outline"
        @click="resetBulkWithdraw"
      >
        {{ $t('bulkWithdraw.buttonReset') }} 
      </ButtonWithTooltip>
    </div>

    <div v-else-if="fundedCards?.length === 0">
      <p class="mb-4">
        {{ $t('bulkWithdraw.noFundedCards') }}
      </p>
      <ButtonDefault
        variant="outline"
        :href="router.resolve(to).href"
        @click="onBacklinkClick"
      >
        {{ $t('general.back') }}
      </ButtonDefault>
    </div>

    <div v-else-if="bulkWithdraw != null">
      <LightningQrCode
        :value="bulkWithdraw.lnurl"
        :success="bulkWithdraw.withdrawn != null"
        :pending="bulkWithdraw.withdrawPending || resetting"
      />
      <div class="flex justify-center">
        <ButtonWithTooltip
          type="submit"
          variant="outline"
          :disabled="resetting"
          @click="resetBulkWithdraw"
        >
          {{ $t('bulkWithdraw.buttonReset') }} 
        </ButtonWithTooltip>
      </div>
    </div>

    <div v-else-if="fundedCards != null">
      <p class="mt-4">
        {{ $t('bulkWithdraw.description') }}
      </p>

      <ButtonDefault
        class="mt-4"
        :loading="creating"
        :disabled="creating"
        @click="create"
      >
        {{ $t('bulkWithdraw.buttonCreate') }}
      </ButtonDefault>
    </div>

    <CardsList
      class="w-full mt-6"
      :funded-cards="fundedCards || []"
    />
  </div>
</template>

<script lang="ts" setup>
import { computed, onBeforeMount, ref, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import type { Settings } from '@shared/data/redis/Set'

import type { Card } from '@backend/trpc/data/Card'
import type { BulkWithdraw } from '@backend/trpc/data/BulkWithdraw'

import CardsList from '@/components/bulkWithdraw/CardsList.vue'
import HeadlineDefault from '@/components/typography/HeadlineDefault.vue'
import LinkDefault from '@/components/typography/LinkDefault.vue'
import ButtonWithTooltip from '@/components/ButtonWithTooltip.vue'
import CardsSummary from '@/components/CardsSummary.vue'
import CardsSummaryContainer from '@/components/CardsSummaryContainer.vue'
import Translation from '@/modules/I18nT'
import hashSha256 from '@/modules/hashSha256'
import useBacklink from '@/modules/useBackLink'
import useTRpc from '@/modules/useTRpc'
import {
  getDefaultSettings,
  decodeCardsSetSettings,
} from '@/stores/cardsSets'
import ButtonDefault from '@/components/ButtonDefault.vue'
import LightningQrCode from '@/components/LightningQrCode.vue'

const route = useRoute()
const router = useRouter()

const { to, onBacklinkClick } = useBacklink()
const { client } = useTRpc()

const requestFailed = ref(false)
const initializing = ref(true)

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
  && !card.isLockedByBulkWithdraw
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

const reload = () => location.reload()
</script>
