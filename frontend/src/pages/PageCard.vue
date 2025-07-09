<template>
  <TheLayout>
    <CenterContainer>
      <HeadlineDefault level="h1" class="text-center mb-10">
        {{ $t('card.title') }}
      </HeadlineDefault>
      <div class="shadow-default rounded-default p-4 my-4">
        <IconAnimatedLoadingWheel v-if="loadingCardStatus" class="w-10 h-10 mx-auto my-20 text-yellow pointer-events-none select-none" />
        <template v-else>
          <div v-if="userErrorMessage" class="text-red class=mb-4">
            {{ userErrorMessage }}
          </div>
          <div class="mb-8">
            <HeadlineDefault level="h3">
              {{ $t('general.status') }}
            </HeadlineDefault>
            <CardStatusPill
              v-if="cardStatus"
              :status="cardStatus.status"
              :url="landingPageUrlWithCardHash"
            />
          </div>
          <ButtonContainer v-if="cardStatusCategory === 'userActionRequired'">
            <ButtonDefault
              :to="{ name: 'funding', params: { cardHash: props.cardHash, lang: route.params.lang } }"
            >
              {{ $t('card.actions.toFundingPage') }}
            </ButtonDefault>
          </ButtonContainer>
          <ButtonContainer v-else-if="cardStatusCategory === 'unfunded'">
            <ButtonDefault
              :to="{ name: 'funding', params: { cardHash: props.cardHash, lang: route.params.lang } }"
            >
              {{ $t('card.actions.fund') }}
            </ButtonDefault>
          </ButtonContainer>
          <template v-else>
            <HeadlineDefault level="h3">
              {{ $t('general.amount') }}
            </HeadlineDefault>
            <AmountDisplayFinalSum
              v-if="cardStatus?.amount && rateBtcFiat"
              :amount-sats="cardStatus.amount"
              :rate-btc-fiat="rateBtcFiat[currentFiat]"
              :fiat-currency="currentFiat"
              selected-currency="BTC"
              size="lg"
            />
          </template>
        </template>
      </div>
      <div class="grid place-items-center my-16">
        <LinkDefault
          :href="landingPageUrlWithCardHash"
          :data-lnurl="landingPageUrlWithLnurl"
          target="_self"
          no-bold
          no-underline
          data-test="card-preview"
        >
          <CardFront
            class="border border-yellow"
            :width="85"
            :height="55"
            :cards-per-row="1"
            :cards-per-page="1"
            :index-on-page="0"
            :qr-code-size="41"
            :qr-code-x="3"
            :qr-code-y="7"
            :card-gap-horizontal="0"
            :card-gap-vertical="0"
            :font-size-headline="3.7"
            :font-size-text="3.3"
            :borders="false"
            :crop-marks="false"
            :front-side-image="null"
            :landing-page-url="landingPageUrlWithLnurl"
            :selected-card-logo="undefined"
            :headline="headline"
            :copytext="copytext"
            :show-text="true"
          />
        </LinkDefault>
      </div>
    </CenterContainer>
  </TheLayout>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import { getCardsSummaryStatusCategoryForCardStatus } from '@shared/modules/statusCategoryHelpers'

import useLandingPages from '@/modules/useLandingPages'
import { rateBtcFiat } from '@/modules/rateBtcFiat'
import { useI18nHelpers } from '@/modules/initI18n'
import CardFront from './setPrinting/components/CardFront.vue'
import TheLayout from '@/components/layout/TheLayout.vue'
import CenterContainer from '@/components/layout/CenterContainer.vue'
import LinkDefault from '@/components/typography/LinkDefault.vue'
import HeadlineDefault from '@/components/typography/HeadlineDefault.vue'
import { useCardStatus } from './landing/useCardStatus'
import CardStatusPill from '@/components/cardStatusList/components/CardStatusPill.vue'
import AmountDisplayFinalSum from '@/components/AmountDisplayFinalSum.vue'
import ButtonDefault from '@/components/buttons/ButtonDefault.vue'
import { useRoute } from 'vue-router'
import ButtonContainer from '@/components/buttons/ButtonContainer.vue'
import IconAnimatedLoadingWheel from '@/components/icons/IconAnimatedLoadingWheel.vue'


const props = defineProps({
  cardHash: {
    type: String,
    required: true,
  },
})

const route = useRoute()

const { t } = useI18n()

const { getLandingPageUrlWithLnurl, getLandingPageUrlWithCardHash } = useLandingPages()

const landingPageUrlWithLnurl = getLandingPageUrlWithLnurl(props.cardHash)
const landingPageUrlWithCardHash = getLandingPageUrlWithCardHash(props.cardHash)

const {
  loadingCardStatus,
  cardStatus,
  userErrorMessage,
} = useCardStatus()

const cardStatusCategory = computed(() => cardStatus.value ? getCardsSummaryStatusCategoryForCardStatus(cardStatus.value.status) : undefined)

const { currentFiat } = useI18nHelpers()

const headline = t('cards.settings.defaults.cardHeadline')
const copytext = t('cards.settings.defaults.cardCopytext')
</script>
