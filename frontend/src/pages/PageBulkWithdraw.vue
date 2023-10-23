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
    <div v-if="cardLockedByWithdraw != null">
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
    <div v-else-if="fundedCards != null">
      <CardsSummaryContainer>
        <CardsSummary
          :cards-count="fundedCards.length"
          :title="$t('cards.status.labelFunded', 2)"
          :sats="fundedCardsTotalAmount"
        />
      </CardsSummaryContainer>

      <p class="mt-4 mb-6">
        todo : add some explanation text + button to create withdraw link here
      </p>

      <ul class="w-full my-5">
        <li
          v-for="{
            hash,
            shared, amount, noteForStatusPage,
            funded, withdrawn,
            landingPageViewed,
          } in fundedCards"
          :key="hash"
          class="py-1 border-b border-grey"
        >
          <CardStatus
            status="funded"
            :funded-date="funded != null ? funded.getTime() / 1000 : undefined"
            :used-date="withdrawn != null ? withdrawn.getTime() / 1000 : undefined"
            :shared="shared"
            :amount="amount.funded || undefined"
            :note="noteForStatusPage"
            :url="getLandingPageUrl(hash, 'preview', settings.landingPage || undefined)"
            :viewed="landingPageViewed != null"
          />
        </li>
      </ul>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, onBeforeMount, ref, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import type { Settings } from '@shared/data/redis/Set'

import type { Card } from '@backend/trpc/data/Card'

import HeadlineDefault from '@/components/typography/HeadlineDefault.vue'
import ButtonWithTooltip from '@/components/ButtonWithTooltip.vue'
import CardsSummary from '@/components/CardsSummary.vue'
import CardsSummaryContainer from '@/components/CardsSummaryContainer.vue'
import CardStatus from '@/components/CardStatus.vue'
import Translation from '@/modules/I18nT'
import hashSha256 from '@/modules/hashSha256'
import useBacklink from '@/modules/useBackLink'
import useLandingPages from '@/modules/useLandingPages'
import useTRpc from '@/modules/useTRpc'
import {
  getDefaultSettings,
  decodeCardsSetSettings,
} from '@/stores/cardsSets'
import ButtonDefault from '@/components/ButtonDefault.vue'

const route = useRoute()
const router = useRouter()

const { to, onBacklinkClick } = useBacklink()
const { getLandingPageUrl } = useLandingPages()
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

const cardLockedByWithdraw = computed(() => cards.value?.find((card) => card.isLockedByBulkWithdraw))

const resetBulkWithdraw = async () => {
  if (cardLockedByWithdraw.value == null) {
    return
  }
  await client.bulkWithdraw.deleteByCardHash.mutate(cardLockedByWithdraw.value.hash)
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

// todo : add button for withdraw creation
// todo : on withdraw creation show withdraw link
// todo : handle loading states
// todo : handle errors
// todo : clean up file (move stuff into sub-components or composables)
</script>
