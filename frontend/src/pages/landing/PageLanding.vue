<template>
  <TheLayout :hide-faqs="!isLoggedIn">
    <CenterContainer
      v-if="!showContent"
      class="min-h-[60dvh] flex justify-center items-center"
    >
      <IconAnimatedLoadingWheel
        v-if="showLoadingAnimation"
        class="w-10 h-10 text-yellow"
      />
    </CenterContainer>
    <template v-else>
      <CenterContainer v-if="userErrorMessage != null">
        <ParagraphDefault class="text-center text-red-500">
          {{ userErrorMessage }}
        </ParagraphDefault>
      </CenterContainer>

      <GreetingIsLockedByBulkWithdraw
        v-if="(
          cardStatus?.status === CardStatusEnum.enum.isLockedByBulkWithdraw
          || cardStatus?.status === CardStatusEnum.enum.bulkWithdrawPending
        )"
        :card-status="cardStatus"
        :resetting-bulk-withdraw="resettingBulkWithdraw"
        class="mb-7"
        @reset-bulk-withdraw="resetBulkWithdraw"
      />
      <GreetingFunded
        v-else-if="cardStatus?.status === CardStatusEnum.enum.funded || cardStatus?.status === CardStatusEnum.enum.withdrawPending"
        class="mb-7"
        :card-status="cardStatus"
      />
      <GreetingRecentlyWithdrawn
        v-else-if="cardStatus?.status === CardStatusEnum.enum.recentlyWithdrawn"
        class="mb-7"
      />
      <GreetingWithdrawn
        v-else-if="cardStatus?.status === CardStatusEnum.enum.withdrawn"
        class="mb-7"
      />
      <GreetingPreview
        v-else
        class="mb-7"
      />

      <CenterContainer class="my-7">
        <ParagraphDefault class="text-center">
          <LinkDefault
            href="#what-is-bitcoin"
            no-bold
            no-underline
            class="group"
          >
            <IconLogoBitcoin class="inline-block w-8 h-auto align-middle me-3" />
            <span class="underline group-hover:no-underline align-middle">
              {{ $t('landing.sectionBitcoin.title') }}
            </span>
          </LinkDefault>
        </ParagraphDefault>
      </CenterContainer>

      <GetYourBitcoin
        v-if="(
          (
            cardStatus?.status === CardStatusEnum.enum.funded
            || cardStatus?.status === CardStatusEnum.enum.withdrawPending
            || cardStatus?.status === CardStatusEnum.enum.recentlyWithdrawn
          )
          && lnurl != null
        )"
        :card-status="cardStatus"
        :lnurl="lnurl"
      />

      <NoWallet class="my-12" />

      <UseYourBitcoin class="my-12" />

      <WhatIsBitcoin id="what-is-bitcoin" class="my-12" />

      <MoreBitcoinExplanation class="my-12" />

      <CreateYourOwnTipCard class="mt-12 mb-10" />
    </template>
  </TheLayout>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { computed, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'

import { CardStatusEnum, unfundedStatuses, type CardStatusDto } from '@shared/data/trpc/tipcards/CardStatusDto'
import LNURL from '@shared/modules/LNURL/LNURL'

import IconAnimatedLoadingWheel from '@/components/icons/IconAnimatedLoadingWheel.vue'
import CenterContainer from '@/components/layout/CenterContainer.vue'
import TheLayout from '@/components/layout/TheLayout.vue'
import ParagraphDefault from '@/components/typography/ParagraphDefault.vue'
import { cardHashFromLnurl } from '@/modules/lnurlHelpers'
import useDelayedLoadingAnimation from '@/modules/useDelayedLoadingAnimation'
import useTRpc from '@/modules/useTRpc'
import { useAuthStore } from '@/stores/auth'
import { BACKEND_API_ORIGIN } from '@/constants'

import GetYourBitcoin from './GetYourBitcoin.vue'
import GreetingFunded from './GreetingFunded.vue'
import GreetingIsLockedByBulkWithdraw from './GreetingIsLockedByBulkWithdraw.vue'
import GreetingRecentlyWithdrawn from './GreetingRecentlyWithdrawn.vue'
import GreetingWithdrawn from './GreetingWithdrawn.vue'
import NoWallet from './NoWallet.vue'
import UseYourBitcoin from './UseYourBitcoin.vue'
import MoreBitcoinExplanation from './MoreBitcoinExplanation.vue'
import CreateYourOwnTipCard from './CreateYourOwnTipCard.vue'
import GreetingPreview from './GreetingPreview.vue'
import WhatIsBitcoin from './WhatIsBitcoin.vue'
import LinkDefault from '@/components/typography/LinkDefault.vue'
import IconLogoBitcoin from '@/components/icons/IconLogoBitcoin.vue'

const {
  loading: loadingCardStatus,
  showLoadingAnimation,
  showContent,
} = useDelayedLoadingAnimation()
const route = useRoute()
const router = useRouter()
const { isLoggedIn } = storeToRefs(useAuthStore())
const { t } = useI18n()
const { bulkWithdraw, card } = useTRpc()

const cardStatus = ref<CardStatusDto>()
const userErrorMessage = ref<string | undefined>()
const resettingBulkWithdraw = ref(false)

const cardIsNotFunded = computed(() => {
  if (cardStatus.value == null) {
    return undefined
  }
  return unfundedStatuses.includes(cardStatus.value.status)
})

const cardHash = computed<string | null>(() => {
  if (typeof route.params.cardHash === 'string' && route.params.cardHash.length > 0) {
    return route.params.cardHash
  }
  if (typeof route.query.lightning === 'string' && route.query.lightning.length > 0) {
    return cardHashFromLnurl(route.query.lightning)
  }
  return null
})

const lnurl = computed<string | null>(() => {
  if (typeof route.params.cardHash === 'string' && route.params.cardHash.length > 0) {
    return LNURL.encode(`${BACKEND_API_ORIGIN}/api/lnurl/${route.params.cardHash}`)
  }
  if (typeof route.query.lightning === 'string' && route.query.lightning.length > 0) {
    return route.query.lightning
  }
  return null
})

const isViewedFromQrCodeScan = computed(() => typeof route.query.lightning === 'string' && route.query.lightning.length > 0)

onMounted(() => loadCardStatus())

watch(cardStatus, (newStatus, oldStatus) => {
  if (oldStatus == null && newStatus != null) {
    afterInitialCardStatusLoadHandler()
  }
})

const loadCardStatus = async (): Promise<boolean> => {
  if (loadingCardStatus.value) {
    return false
  }

  if (cardHash.value == null) {
    if (lnurl.value != null && lnurl.value !== '') {
      userErrorMessage.value = t('landing.errors.errorInvalidLnurl')
    }
    return false
  }

  loadingCardStatus.value = true
  try {
    cardStatus.value = await card.status.query({ hash: cardHash.value })
    return true
  } catch (error) {
    userErrorMessage.value = t('landing.errors.errorLoadingCardStatus')
    return false
  } finally {
    loadingCardStatus.value = false
    setTimeout(loadCardStatus, 10_000)
  }
}

const afterInitialCardStatusLoadHandler = () => {
  if (cardHash.value == null) {
    return
  }
  if (cardIsNotFunded.value) {
    redirectToFundingPage(cardHash.value)
  } else if (isViewedFromQrCodeScan.value) {
    setLandingPageViewed(cardHash.value)
    rewriteUrlToCardHash(cardHash.value)
  }
}

const redirectToFundingPage = (cardHash: string) => {
  router.replace({
    name: 'funding',
    params: {
      lang: route.params.lang,
      cardHash,
    },
  })
}

const setLandingPageViewed = (cardHash: string) => card.landingPageViewed.mutate({ hash: cardHash })

const rewriteUrlToCardHash = (cardHash: string) => router.replace({
  name: 'landing',
  params: {
    lang: route.params.lang,
    cardHash,
  },
})

const resetBulkWithdraw = async () => {
  if (cardHash.value == null) {
    return
  }
  userErrorMessage.value = undefined
  resettingBulkWithdraw.value = true
  try {
    await bulkWithdraw.deleteByCardHash.mutate({ hash: cardHash.value })
    await loadCardStatus()
  } catch (error) {
    console.error(error)
    userErrorMessage.value = t('landing.bulkWithdrawResetError')
  }
  resettingBulkWithdraw.value = false
}
</script>
