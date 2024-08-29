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

      <!--
        todo : use this as a guide to refactor the page, move all sections into separate files/components

        <section class="greeting">
          handle cardStatus:
          * isLockedByBulkWithdraw (make this into separate cardStatus)
          * funded/withdrawPending
          * recentlyWithdrawn
          * withdrawn
        </section>

        <section class="get-your-bitcoin">
          show if cardStatus:
          * funded/withdrawPending
          * recentlyWithdrawn
        </section>

        <section class="no-wallet">
          show always
        </section>

        <section class="use-your-bitcoin">
          show always
        </section>

        <section class="more-bitcoin-explanation">
          show always
        </section>

        <section class="create-your-own-tip-card">
          show always
        </section>
      -->

      <CenterContainer class="relative mb-14 flex flex-col items-center">
        <IconLightningBolt
          class="
            absolute w-[100px] h-[150px] -top-2 -end-8
            scale-x-[-1]
            text-yellow opacity-20
          "
        />
        <HeadlineDefault level="h1" styling="h2">
          {{ $t('landing.introGreeting') }}
        </HeadlineDefault>
        <ParagraphDefault class="mb-10 text-center">
          <I18nT keypath="landing.introMessage">
            <template #linebreak>
              <br>
            </template>
          </I18nT>
        </ParagraphDefault>
        <div
          v-if="cardStatus?.amount != null"
          class="w-[250px] mb-5 p-2 flex flex-col items-center border border-yellow rounded-default"
        >
          <span class="font-bold">
            <FormatBitcoin
              leading-zeros-class="text-white-50"
              :value="cardStatus.amount / (100 * 1000 * 1000)"
              :format="{ minimumFractionDigits: 8, maximumFractionDigits: 8 }"
            />
            BTC
          </span>
          <span v-if="amountInFiat != null" class="mt-1 text-xs">
            {{
              $n(amountInFiat, {
                style: 'currency',
                currency: currentFiat,
                currencyDisplay: 'code',
              })
            }}
          </span>
        </div>
        <CollapsibleElement
          level="h4"
          class="w-[250px]"
          hover-press-effect
          :title="$t('landing.sectionBitcoin.title')"
        >
          <IconLogoBitcoin class="w-16 mb-3 ltr:float-right ltr:ml-3 rtl:float-left rtl:mr-3" />
          <!-- eslint-disable vue/no-v-html, vue/no-v-text-v-html-on-component -->
          <ParagraphDefault v-html="sanitizeI18n(t('landing.sectionBitcoin.paragraphs.0'))" />
          <ParagraphDefault v-html="sanitizeI18n(t('landing.sectionBitcoin.paragraphs.1'))" />
          <ParagraphDefault v-html="sanitizeI18n(t('landing.sectionBitcoin.paragraphs.2'))" />
          <!-- eslint-enable vue/no-v-html, vue/no-v-text-v-html-on-component -->
        </CollapsibleElement>
      </CenterContainer>
      <CenterContainer class="relative mb-14 flex flex-col items-center">
        <HeadlineDefault level="h2">
          {{ t('landing.sectionGetYourBitcoin.headline') }}
        </HeadlineDefault>
        <!-- eslint-disable vue/no-v-html, vue/no-v-text-v-html-on-component -->
        <ParagraphDefault
          class="text-center"
          v-html="sanitizeI18n(t('landing.sectionGetYourBitcoin.explanation'))"
        />
        <!-- eslint-enable vue/no-v-html, vue/no-v-text-v-html-on-component -->
        <LightningQrCode
          v-if="lnurl != null"
          class="my-7"
          :value="lnurl"
          :success="cardIsWithdrawn"
          :pending="cardWithdrawIsPending"
        >
          <template #headline>
            <div class="flex flex-col items-end">
              <HeadlineDefault level="h3" class="mb-0 text-right">
                {{ t('landing.sectionGetYourBitcoin.qrCodeHeadline') }}
              </HeadlineDefault>
              <LinkDefault href="#no-wallet" class="font-normal">
                {{ t('landing.sectionGetYourBitcoin.noWallet') }}
              </LinkDefault>
            </div>
          </template>
        </LightningQrCode>
      </CenterContainer>
    </template>
  </TheLayout>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { computed, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'

import type { CardStatusDto } from '@shared/data/trpc/tipcards/CardStatusDto'
import LNURL from '@shared/modules/LNURL/LNURL'

import IconAnimatedLoadingWheel from '@/components/icons/IconAnimatedLoadingWheel.vue'
import IconLightningBolt from '@/components/icons/IconLightningBolt.vue'
import IconLogoBitcoin from '@/components/icons/IconLogoBitcoin.vue'
import CenterContainer from '@/components/layout/CenterContainer.vue'
import TheLayout from '@/components/layout/TheLayout.vue'
import HeadlineDefault from '@/components/typography/HeadlineDefault.vue'
import LinkDefault from '@/components/typography/LinkDefault.vue'
import ParagraphDefault from '@/components/typography/ParagraphDefault.vue'
import CollapsibleElement from '@/components/CollapsibleElement.vue'
import FormatBitcoin from '@/components/FormatBitcoin.vue'
import LightningQrCode from '@/components/LightningQrCode.vue'
import { useI18nHelpers } from '@/modules/initI18n'
import { cardHashFromLnurl } from '@/modules/lnurlHelpers'
import { rateBtcFiat } from '@/modules/rateBtcFiat'
import sanitizeI18n from '@/modules/sanitizeI18n'
import useDelayedLoadingAnimation from '@/modules/useDelayedLoadingAnimation'
import useTRpc from '@/modules/useTRpc'
import { useAuthStore } from '@/stores/auth'
import { BACKEND_API_ORIGIN } from '@/constants'
import { CardStatusEnum } from '@/modules/loadCardStatus'

const {
  loading: loadingCardStatus,
  showLoadingAnimation,
  showContent,
} = useDelayedLoadingAnimation()
const route = useRoute()
const router = useRouter()
const { isLoggedIn } = storeToRefs(useAuthStore())
const { t } = useI18n()
const { currentFiat } = useI18nHelpers()
const { card } = useTRpc()

const cardStatus = ref<CardStatusDto>()
const userErrorMessage = ref<string | undefined>()

const cardIsNotFunded = computed(() => {
  if (cardStatus.value == null) {
    return undefined
  }
  const unfundedStatuses: CardStatusEnum[] = [
    CardStatusEnum.enum.unfunded,
    CardStatusEnum.enum.invoiceFunding,
    CardStatusEnum.enum.lnurlpFunding,
    CardStatusEnum.enum.lnurlpSharedFunding,
    CardStatusEnum.enum.setInvoiceFunding,
    CardStatusEnum.enum.invoiceExpired,
    CardStatusEnum.enum.lnurlpExpired,
    CardStatusEnum.enum.lnurlpSharedExpiredEmpty,
    CardStatusEnum.enum.lnurlpSharedExpiredFunded,
    CardStatusEnum.enum.setInvoiceExpired,
  ]
  return unfundedStatuses.includes(cardStatus.value.status)
})

const cardWithdrawIsPending = computed(() => {
  if (cardStatus.value == null) {
    return undefined
  }
  return cardStatus.value.status === CardStatusEnum.enum.withdrawPending
})

const cardIsWithdrawn = computed(() => {
  if (cardStatus.value == null) {
    return undefined
  }
  const withdrawnStatuses: CardStatusEnum[] = [
    CardStatusEnum.enum.recentlyWithdrawn,
    CardStatusEnum.enum.withdrawn,
  ]
  return withdrawnStatuses.includes(cardStatus.value.status)
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

const amountInFiat = computed(() => {
  if (
    cardStatus.value?.amount == null
    || rateBtcFiat.value == null
    || rateBtcFiat.value[currentFiat.value] == null
  ) {
    return undefined
  }
  return (cardStatus.value.amount / (100_000_000)) * rateBtcFiat.value[currentFiat.value]
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
</script>
