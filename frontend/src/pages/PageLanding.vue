<template>
  <div class="mx-auto w-full max-w-md">
    <BackLink
      :only-internal-referrer="$route.name === 'landing'"
      class="pt-4 px-4"
    />
    <div
      class="my-10 mx-auto px-4 w-full max-w-md"
    >
      <HeadlineDefault level="h1" class="mb-8">
        <span class="text-5xl">{{ t('landing.introGreeting') }}</span>
      </HeadlineDefault>
      <div v-if="userErrorMessage != null" class="my-4">
        <ParagraphDefault
          class="text-red-500"
          dir="ltr"
        >
          {{ userErrorMessage }}
        </ParagraphDefault>
      </div>
      <div v-if="showContent === 'spendable'">
        <HeadlineDefault level="h2" styling="h1">
          <I18nT keypath="landing.introMessageReceiveBtc.message">
            <template #amountAndUnit>
              <span class="inline-block">
                <I18nT keypath="landing.introMessageReceiveBtc.amountAndUnit">
                  <template #amount>
                    <FormatBitcoin
                      v-if="amount != null"
                      :value="amount / (100 * 1000 * 1000)"
                      :format="{ minimumFractionDigits: 8, maximumFractionDigits: 8 }"
                      leading-zeros-class="text-grey-medium"
                    />
                  </template>
                </I18nT>*
              </span>
            </template>
          </I18nT>
        </HeadlineDefault>
        <ParagraphDefault
          v-if="amountInFiat != null && amountInFiat >= 0.01"
          class="text-sm mt-3"
        >
          *
          <I18nT keypath="landing.introMessageReceiveBtc.footnoteFiat">
            <template #btc>
              {{
                t('landing.introMessageReceiveBtc.amountAndUnitBtc', {
                  amount: formatNumber(Number(amount) / (100 * 1000 * 1000), 8, 8),
                })
              }}
            </template>
            <template #fiat>
              {{
                $n(amountInFiat, {
                  style: 'currency',
                  currency: currentFiat,
                  currencyDisplay: 'code',
                })
              }}
            </template>
          </I18nT>
        </ParagraphDefault>
        <ParagraphDefault v-if="amountInFiat != null && amountInFiat < 0.01" class="text-sm mt-3">
          * {{ t('landing.introMessageReceiveBtc.footnote') }}
        </ParagraphDefault>
      </div>
      <div v-if="showContent === 'preview'">
        <HeadlineDefault level="h2" styling="h1">
          {{ t('landing.introMessagePreview.headline') }}
        </HeadlineDefault>
        <ParagraphDefault>
          <I18nT keypath="landing.introMessagePreview.message">
            <template #exchange>
              <LinkDefault href="https://kraken.com/">Kraken</LinkDefault>
            </template>
            <template #atm>
              <LinkDefault href="https://kurant.net/">Kurant</LinkDefault>
            </template>
            <template #broker>
              <LinkDefault href="https://coinfinity.co/">Coinfinity</LinkDefault>
            </template>
          </I18nT>
        </ParagraphDefault>
      </div>
      <div v-if="showContent === 'used'">
        <HeadlineDefault level="h2" styling="h1">
          {{ t('landing.introMessageAlreadyUsed.headline') }}
        </HeadlineDefault>
        <ParagraphDefault>
          <I18nT keypath="landing.introMessageAlreadyUsed.message">
            <template #exchange>
              <LinkDefault href="https://kraken.com/">Kraken</LinkDefault>
            </template>
            <template #atm>
              <LinkDefault href="https://kurant.net/">Kurant</LinkDefault>
            </template>
            <template #broker>
              <LinkDefault href="https://coinfinity.co/">Coinfinity</LinkDefault>
            </template>
          </I18nT>
        </ParagraphDefault>
      </div>
      <div v-if="showContent === 'recentlyUsed'">
        <HeadlineDefault level="h2" styling="h1">
          {{ t('landing.introMessageJustReceived.headline', { emoji: '🥳' }) }}
        </HeadlineDefault>
        <ParagraphDefault>
          <I18nT keypath="landing.introMessageJustReceived.message">
            <template #exchange>
              <LinkDefault href="https://kraken.com/">Kraken</LinkDefault>
            </template>
            <template #atm>
              <LinkDefault href="https://kurant.net/">Kurant</LinkDefault>
            </template>
            <template #broker>
              <LinkDefault href="https://coinfinity.co/">Coinfinity</LinkDefault>
            </template>
          </I18nT>
        </ParagraphDefault>
      </div>
      <div class="my-10">
        <IconBitcoin class="w-16 mb-3 ltr:float-right ltr:ml-3 rtl:float-left rtl:mr-3" />
        <!-- eslint-disable vue/no-v-html, vue/no-v-text-v-html-on-component -->
        <ParagraphDefault v-html="sanitizeI18n(t('landing.sectionBitcoin.paragraphs.0'))" />
        <ParagraphDefault v-html="sanitizeI18n(t('landing.sectionBitcoin.paragraphs.1'))" />
        <ParagraphDefault v-html="sanitizeI18n(t('landing.sectionBitcoin.paragraphs.2'))" />
        <!-- eslint-enable vue/no-v-html, vue/no-v-text-v-html-on-component -->
      </div>
      <div class="my-10">
        <HeadlineDefault level="h2">
          <span v-if="showContent !== 'used' && showContent !== 'preview'">1. </span>{{ t('landing.sectionWallet.headline') }}
        </HeadlineDefault>
        <!-- eslint-disable-next-line vue/no-v-html, vue/no-v-text-v-html-on-component -->
        <ParagraphDefault v-html="sanitizeI18n(t('landing.sectionWallet.explanation'))" />
        <ParagraphDefault>
          <I18nT keypath="landing.sectionWallet.recommendation">
            <template #walletOfSatoshi>
              <LinkDefault href="https://www.walletofsatoshi.com/">Wallet of Satoshi</LinkDefault>
            </template>
          </I18nT>
        </ParagraphDefault>
        <ParagraphDefault class="text-center mt-4 mb-6">
          <LinkDefault
            href="https://www.walletofsatoshi.com/"
            class="inline-block w-40 my-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 313.1 76.32">
              <path fill="#fad228" d="M110.47 44.8H121c.84 0 1.22-.64.9-1.48l-17.6-42A2 2 0 0 0 102.22 0H87.63a2 2 0 0 0-2 1.34L66 48.11c-.32.84.06 1.48.83 1.48h13.7a1.42 1.42 0 0 1 1.32 1.93l-9.7 24.8 30.55-32.63A1 1 0 0 0 102 42H84.73a1.42 1.42 0 0 1-1.32-2l5.06-12.91 6.86-17.47 6.78 17.51h-7.54a1.42 1.42 0 0 0-1.32.9l-2.83 7.22a1.42 1.42 0 0 0 1.32 1.93H105a1.42 1.42 0 0 1 1.33.91l2.08 5.36a1.92 1.92 0 0 0 2.06 1.35Zm62.65 0h37.42a1.3 1.3 0 0 0 1.46-1.41V35.9a1.3 1.3 0 0 0-1.47-1.41h-26V1.41A1.35 1.35 0 0 0 183 0h-9.92a1.3 1.3 0 0 0-1.47 1.41v42a1.3 1.3 0 0 0 1.51 1.39Zm45.36 0h42a1.3 1.3 0 0 0 1.52-1.41V35.9a1.31 1.31 0 0 0-1.47-1.41h-30.59v-7.36h25.59a1.33 1.33 0 0 0 1.48-1.4v-7a1.33 1.33 0 0 0-1.48-1.41h-25.59v-7h30.59A1.3 1.3 0 0 0 262 8.89V1.41A1.3 1.3 0 0 0 260.53 0h-42A1.3 1.3 0 0 0 217 1.41v42a1.3 1.3 0 0 0 1.48 1.39ZM71.79 0H61.61a1.71 1.71 0 0 0-1.85 1.41L52.08 34.3 44.91 1.41A1.65 1.65 0 0 0 43.12 0H30.38a1.71 1.71 0 0 0-1.85 1.41L21.36 34.3 13.68 1.41A1.65 1.65 0 0 0 11.89 0H1.14C.24 0-.14.51.05 1.41l10.88 42a1.68 1.68 0 0 0 1.79 1.41H28.4a1.65 1.65 0 0 0 1.79-1.41l6.27-28.31 6.34 28.29a1.65 1.65 0 0 0 1.79 1.41H60.2a1.66 1.66 0 0 0 1.8-1.41l10.87-42C73.07.51 72.68 0 71.79 0Zm239.84 0h-43.52a1.3 1.3 0 0 0-1.47 1.41v7.48a1.3 1.3 0 0 0 1.47 1.41h15.29v33.09a1.3 1.3 0 0 0 1.48 1.41h10a1.33 1.33 0 0 0 1.47-1.41V10.3h15.3a1.3 1.3 0 0 0 1.47-1.41V1.41A1.3 1.3 0 0 0 311.63 0ZM127.76 44.8h37.42a1.3 1.3 0 0 0 1.47-1.41V35.9a1.3 1.3 0 0 0-1.47-1.41h-26V1.41a1.35 1.35 0 0 0-1.5-1.41h-9.92a1.3 1.3 0 0 0-1.47 1.41v42a1.3 1.3 0 0 0 1.47 1.39Zm-3.84 9.6h-11.53c-3.13 0-4.53 1.31-4.53 4.36v10.37c0 3.05 1.4 4.36 4.53 4.36h11.53c3.16 0 4.51-1.31 4.51-4.36V58.76c0-3.05-1.35-4.36-4.51-4.36Zm-1 12.95c0 1.48-.29 1.75-2.07 1.75h-5.51c-1.76 0-2.08-.27-2.08-1.75v-6.81c0-1.47.32-1.75 2.08-1.75h5.51c1.78 0 2.07.28 2.07 1.75Zm51.87-5.59h-8.75c-.89 0-1.16-.27-1.16-.95v-1.06c0-.68.27-1 1.16-1h6.7c.65 0 .89.28.89.85v.16a.55.55 0 0 0 .62.6h4a.55.55 0 0 0 .62-.6v-1.08c0-3.21-1.11-4.28-4.4-4.28H164c-3.19 0-4.51 1.31-4.51 4.36v2.84c0 3.06 1.32 4.36 4.51 4.36h8.74c.9 0 1.17.28 1.17 1v1.23c0 .68-.27.95-1.17.95h-7.34c-.62 0-.86-.27-.86-.85v-.16a.56.56 0 0 0-.62-.6h-4a.55.55 0 0 0-.62.6v1.12c0 3.22 1.08 4.28 4.4 4.28h11.2c3.19 0 4.51-1.31 4.51-4.36v-3c-.06-3.1-1.41-4.41-4.57-4.41Zm85.43 0h-8.75c-.89 0-1.16-.27-1.16-.95v-1.06c0-.68.27-1 1.16-1h6.7c.64 0 .89.28.89.85v.16a.55.55 0 0 0 .62.6h4a.55.55 0 0 0 .62-.6v-1.08c0-3.21-1.11-4.28-4.4-4.28h-10.48c-3.19 0-4.51 1.31-4.51 4.36v2.84c0 3.06 1.32 4.36 4.51 4.36h8.74c.89 0 1.16.28 1.16 1v1.23c0 .68-.27.95-1.16.95h-7.34c-.62 0-.86-.27-.86-.85v-.16a.57.57 0 0 0-.62-.6h-4.05a.55.55 0 0 0-.62.6v1.12c0 3.22 1.08 4.28 4.4 4.28h11.2c3.18 0 4.51-1.31 4.51-4.36v-3c0-3.1-1.33-4.41-4.51-4.41Zm26.65-7.36h-4.21a.56.56 0 0 0-.63.6v6.66h-9.2V55a.57.57 0 0 0-.65-.6H268a.55.55 0 0 0-.62.6v17.89a.55.55 0 0 0 .62.6h4.18a.57.57 0 0 0 .65-.6v-6.84h9.2v6.84a.56.56 0 0 0 .63.6h4.21a.55.55 0 0 0 .62-.6V55a.55.55 0 0 0-.57-.6Zm-137.62 0h-17.07a.55.55 0 0 0-.62.6v17.89a.55.55 0 0 0 .62.6h4.19a.58.58 0 0 0 .65-.6v-6.52h10.15a.57.57 0 0 0 .64-.6v-3.19a.57.57 0 0 0-.64-.6H137v-3.19h12.3a.55.55 0 0 0 .62-.6V55a.55.55 0 0 0-.62-.6Zm146.47 0h-4.18a.55.55 0 0 0-.62.6v17.89a.55.55 0 0 0 .62.6h4.18a.57.57 0 0 0 .65-.6V55a.57.57 0 0 0-.6-.6Zm-100.28.6a.83.83 0 0 0-.86-.57h-6.16a.83.83 0 0 0-.89.57l-7.42 17.89c-.14.36 0 .63.38.63h4.45a.8.8 0 0 0 .86-.57l1-2.68h9.1l1 2.68a.8.8 0 0 0 .87.57h4.69c.33 0 .49-.27.35-.63Zm-7 11 2.89-7.52 2.92 7.52Zm30.9-11.6H201a.55.55 0 0 0-.62.6v3.19a.55.55 0 0 0 .62.6h6.45v14.1a.55.55 0 0 0 .62.6h4.21a.56.56 0 0 0 .62-.6v-14.1h6.46a.55.55 0 0 0 .62-.6V55a.55.55 0 0 0-.64-.6Zm18.46 0h-11.52c-3.13 0-4.54 1.31-4.54 4.36v10.37c0 3.05 1.41 4.36 4.54 4.36h11.52c3.16 0 4.51-1.31 4.51-4.36V58.76c0-3.05-1.31-4.36-4.51-4.36Zm-.94 12.95c0 1.48-.3 1.75-2.08 1.75h-5.51c-1.75 0-2.07-.27-2.07-1.75v-6.81c0-1.47.32-1.75 2.07-1.75h5.51c1.78 0 2.08.28 2.08 1.75Z" />
            </svg>
          </LinkDefault>
          <br>
          <ButtonDefault href="https://www.walletofsatoshi.com/">
            {{ t('landing.sectionWallet.button') }}
          </ButtonDefault>
        </ParagraphDefault>
        
        <ParagraphDefault>
          <I18nT keypath="landing.sectionWallet.other">
            <template #wallet0>
              <LinkDefault href="https://breez.technology/">Breez</LinkDefault>
            </template>
            <template #wallet1>
              <LinkDefault href="https://phoenix.acinq.co/">Phoenix</LinkDefault>
            </template>
            <!-- <template #wallet2>
              <LinkDefault href="https://muun.com/">Muun</LinkDefault>
            </template> -->
          </I18nT>
          <br>
          <small>{{ t('landing.sectionWallet.otherFootnote') }}</small>
        </ParagraphDefault>
      </div>
      <div v-if="showContent !== 'used' && showContent !== 'preview'" class="my-10">
        <HeadlineDefault level="h2">
          2. {{ t('landing.sectionReceive.headline') }}
        </HeadlineDefault>
        <ParagraphDefault v-if="!spent">
          {{ t('landing.sectionReceive.statusNormal.explanation') }}
          <ul class="list-disc ltr:pl-6 rtl:pr-6">
            <!-- eslint-disable vue/no-v-html -->
            <li class="my-1" v-html="sanitizeI18n(t('landing.sectionReceive.statusNormal.step1'))" />
            <li class="my-1" v-html="sanitizeI18n(t('landing.sectionReceive.statusNormal.step2'))" />
            <!-- eslint-enable vue/no-v-html -->
          </ul>
        </ParagraphDefault>
        <ParagraphDefault v-else>
          <strong>{{ t('landing.sectionReceive.statusReceived.congrats') }}</strong>
          {{ t('landing.sectionReceive.statusReceived.message') }} 🎉
        </ParagraphDefault>
        <LightningQrCode
          v-if="lnurl != null"
          :value="lnurl"
          :success="spent"
          :pending="withdrawPending"
          :error="userErrorMessage"
        />
      </div>
      <div class="my-10">
        <HeadlineDefault level="h2">
          <span v-if="showContent !== 'used' && showContent !== 'preview'">3. </span>{{ t('landing.sectionUse.headline') }}
        </HeadlineDefault>
        <ParagraphDefault>
          {{ t('landing.sectionUse.message') }}
        </ParagraphDefault>
        <ParagraphDefault class="text-sm mb-5">
          {{ t('landing.sectionUse.messageFootnote') }}
        </ParagraphDefault>
        <ParagraphDefault>
          {{ t('landing.sectionUse.examplesIntro') }}
        </ParagraphDefault>
        <ul class="list-disc ltr:pl-6 rtl:pr-6">
          <li class="my-1">
            {{ t('landing.sectionUse.examples.saltNDaisy') }}:<br>
            <LinkDefault href="https://saltndaisy.at/">saltndaisy.at</LinkDefault>
          </li>
          <li class="my-1">
            {{ t('landing.sectionUse.examples.satoshistore') }}:<br>
            <LinkDefault href="https://satoshistore.io/">satoshistore.io</LinkDefault>
          </li>
          <li class="my-1">
            {{ t('landing.sectionUse.examples.aprycotMedia') }}:<br>
            <LinkDefault href="https://aprycot.media/">aprycot.media</LinkDefault>
          </li>
          <li class="my-1">
            {{ t('landing.sectionUse.examples.copiaro') }}:<br>
            <LinkDefault href="https://copiaro.de/">copiaro.de</LinkDefault>
          </li>
          <li class="my-1">
            {{ t('landing.sectionUse.examples.lightningnetworkstores') }}:<br>
            <LinkDefault href="https://lightningnetworkstores.com/">lightningnetworkstores.com</LinkDefault>
          </li>
          <li class="my-1">
            {{ t('landing.sectionUse.examples.coinpages') }}:<br>
            <LinkDefault href="https://coinpages.io/">coinpages.io</LinkDefault>
          </li>
        </ul>
        <div
          v-if="te('landing.sectionMore.headline')"
          class="my-7"
        >
          <HeadlineDefault level="h3" class="mt-7">
            {{ t('landing.sectionMore.headline') }}
          </HeadlineDefault>
          <ParagraphDefault
            v-if="te('landing.sectionMore.text')"
            class="mb-6"
          >
            {{ t('landing.sectionMore.text') }}
          </ParagraphDefault>
          <div>
            <template
              v-for="index of [...Array(10).keys()]"
              :key="index"
            >
              <div
                v-if="te(`landing.sectionMore.${index}.text`) || te(`landing.sectionMore.${index}.linkHref`)"
                class="my-8 first:mt-0 last:mb-0"
              >
                <!--eslint-disable vue/no-v-html, vue/no-v-text-v-html-on-component -->
                <ParagraphDefault
                  v-if="te(`landing.sectionMore.${index}.text`)"
                  v-html="sanitizeI18n(t(`landing.sectionMore.${index}.text`))"
                />
                <!--eslint-enable vue/no-v-html, vue/no-v-text-v-html-on-component -->
                <ParagraphDefault v-if="te(`landing.sectionMore.${index}.linkHref`)">
                  <LinkDefault :href="t(`landing.sectionMore.${index}.linkHref`)">
                    {{ t(`landing.sectionMore.${index}.linkLabel`) }}
                  </LinkDefault>
                </ParagraphDefault>
              </div>
            </template>
          </div>
        </div>
        <HeadlineDefault level="h3" class="mt-7">
          {{ t('landing.sectionUse.createYourOwnTipCardsHeadline') }}
        </HeadlineDefault>
        <ParagraphDefault>
          {{ t('landing.sectionUse.createYourOwnTipCardsText') }}
        </ParagraphDefault>
        <ParagraphDefault class="text-center">
          <ButtonDefault
            @click="$router.push({ name: 'home', params: { lang: $route.params.lang } })"
          >
            {{ t('landing.sectionUse.createYourOwnTipCardsButton') }}
          </ButtonDefault>
        </ParagraphDefault>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'

import I18nT from '@/modules/I18nT'
import { useI18nHelpers } from '@/modules/initI18n'
import BackLink from '@/components/BackLink.vue'
import IconBitcoin from '@/components/svgs/IconBitcoin.vue'
import HeadlineDefault from '@/components/typography/HeadlineDefault.vue'
import LinkDefault from '@/components/typography/LinkDefault.vue'
import ParagraphDefault from '@/components/typography/ParagraphDefault.vue'
import ButtonDefault from '@/components/ButtonDefault.vue'
import LightningQrCode from '@/components/LightningQrCode.vue'
import { decodeLnurl } from '@/modules//lnurlHelpers'
import formatNumber from '@/modules/formatNumber'
import { loadCardStatus } from '@/modules/loadCardStatus'
import { rateBtcFiat } from '@/modules/rateBtcFiat'
import sanitizeI18n from '@/modules/sanitizeI18n'
import router from '@/router'
import FormatBitcoin from '@/components/FormatBitcoin.vue'

const { t, te } = useI18n()

const { currentFiat } = useI18nHelpers()

const spent = ref<boolean | undefined>()
const amount = ref<number | undefined | null>()
const userErrorMessage = ref<string | undefined>()
const withdrawPending = ref(false)
const cardUsed = ref<number | undefined>()

const amountInFiat = computed(() => {
  if (amount.value == null || rateBtcFiat.value == null) {
    return undefined
  }
  return (amount.value / (100 * 1000 * 1000)) * rateBtcFiat.value[currentFiat.value]
})

const route = useRoute()

const lnurl = computed(() => typeof route.query.lightning === 'string' ? route.query.lightning : undefined)

const cardHash = computed<string | null | undefined>(() => {
  let decodedLnurl: string
  if (typeof lnurl.value !== 'string') {
    return null
  }
  try {
    decodedLnurl = decodeLnurl(lnurl.value)
  } catch (error) {
    return null
  }
  const [, hash] = decodedLnurl.toLowerCase().match(/\/api\/lnurl\/([0-9a-f]+)/) || []
  return hash
})

const loadLnurlData = async () => {
  if (cardHash.value == null) {
    if (lnurl.value != null && lnurl.value !== '') {
      userErrorMessage.value = t('landing.errors.errorInvalidLnurl')
    }
    return
  }
  const cardStatus = await loadCardStatus(cardHash.value, String(route.name))
  const { status, message, card } = cardStatus

  if (status === 'error' && message != null) {
    userErrorMessage.value = message
    return
  }

  if (card == null || !['used', 'funded'].includes(status)) {
    router.replace({
      name: 'funding',
      params: {
        lang: route.params.lang,
        cardHash: cardHash.value,
      },
    })
    return
  }

  withdrawPending.value = !!card.withdrawPending
  if (status === 'used') {
    spent.value = true
    if (card.used != null) {
      cardUsed.value = card.used
    }
  }
  if (status === 'funded') {
    spent.value = false
  }
  if (cardStatus.amount != null) {
    amount.value = cardStatus.amount
  }

  setTimeout(loadLnurlData, 10 * 1000)
}

const showContent = computed<'preview' | 'spendable' | 'used' | 'recentlyUsed' | null>(() => {
  if (cardHash.value == null) {
    return 'preview'
  }
  
  if (withdrawPending.value) {
    return 'spendable'
  }

  if (!spent.value && amount.value != null) {
    return 'spendable'
  }

  if (cardUsed.value != null) {
    if ((+ new Date() / 1000) - cardUsed.value < 5 * 60) {
      return 'recentlyUsed'
    }
    return 'used'
  }
  return null
})

onMounted(loadLnurlData)

watch(() => route.params.lang, loadLnurlData)
</script>
