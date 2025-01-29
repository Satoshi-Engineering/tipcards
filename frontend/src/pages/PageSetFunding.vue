<template>
  <TheLayout login-banner>
    <CenterContainer>
      <BackLinkDeprecated />
      <div
        v-if="initializing"
        class="flex justify-center flex-1 mt-8"
      >
        <IconAnimatedLoadingWheelDeprecated class="my-20 w-10 h-10" />
      </div>
      <div
        v-else-if="numberOfCardsToFund !== settings.numberOfCards"
        class="flex-1 mt-8"
      >
        <HeadlineDefault
          level="h1"
          class="mt-10 text-center"
        >
          {{ t('setFunding.headline') }}
        </HeadlineDefault>
        <p>
          {{ t('setFunding.textFundingNotPossible') }}
        </p>
        <ButtonDefault
          class="text-sm mt-4"
          :href="cardsHref"
        >
          {{ t('setFunding.backToSet') }}
        </ButtonDefault>
      </div>
      <div
        v-else
        class="flex-1 mt-8"
      >
        <HeadlineDefault
          level="h1"
          class="mt-10 text-center"
        >
          {{ t('setFunding.headline') }}
        </HeadlineDefault>
        <div v-if="invoice != null">
          <LightningQrCode
            class="my-7"
            :value="invoice"
            :success="funded"
            :error="invoiceExpired ? t('setFunding.invoiceExpired') : undefined"
          >
            <template #headline>
              <HeadlineDefault
                level="h2"
                class="mb-4 text-start"
              >
                {{ settings.setName || $t('index.unnamedSetNameFallback') }}
              </HeadlineDefault>
              <ParagraphDefault class="mb-4 text-start">
                <IconTipCardSet class="inline-block w-6 h-6 me-2 text-yellow" /> {{ $t('general.cards', numberOfCardsToFund) }}
              </ParagraphDefault>
            </template>
            <template #preQrCode>
              <ParagraphDefault v-if="invoiceExpired" class="text-sm text-red">
                {{ t('setFunding.invoiceExpired') }}
              </ParagraphDefault>
              <ParagraphDefault v-else class="text-sm">
                <I18nT :keypath="funded ? 'setFunding.invoicePaidSuccessfully' : 'setFunding.payInvoice'">
                  <template #cards>
                    <strong>{{ $t('general.cards', numberOfCardsToFund) }}</strong>
                  </template>
                </I18nT>
              </ParagraphDefault>
              <AmountDisplayFinalSum
                :status="funded ? 'success' : invoiceExpired || userErrorMessage != null ? 'error' : 'pending'"
                :amount-sats="invoiceAmount"
                :rate-btc-fiat="rateBtcEur"
              />
              <AmountDisplayForCalculation
                :amount-sats="invoiceFeeAmount"
                :selected-currency="selectedCurrency"
                :rate-btc-fiat="rateBtcEur"
              >
                <template #label>
                  {{ $t('general.fee') }}
                  <TooltipDefault
                    v-if="fee != null"
                    class="ms-1"
                    :content="$t('funding.form.feeInfo', { fee: `${100 * fee}` })"
                  >
                    <IconInfoCircle class="w-4 text-yellow" />
                  </TooltipDefault>
                </template>
              </AmountDisplayForCalculation>
            </template>
          </LightningQrCode>
          <div class="flex justify-center">
            <ButtonWithTooltip
              type="submit"
              variant="outline"
              data-test="set-funding-reset-invoice"
              :disabled="funded"
              :tooltip="funded ? t('setFunding.resetDisabledTooltip') : undefined"
              @click="resetInvoice"
            >
              {{ t('setFunding.resetInvoice') }}
            </ButtonWithTooltip>
          </div>
        </div>
        <div v-else>
          <div class="max-w-sm mx-auto mb-8 p-5 shadow-default rounded-default ">
            <form @submit.prevent="createInvoice">
              <HeadlineDefault
                level="h2"
                class="mb-4"
              >
                {{ settings.setName || $t('index.unnamedSetNameFallback') }}
              </HeadlineDefault>
              <ParagraphDefault class="mb-4">
                <IconTipCardSet class="inline-block w-6 h-6 me-2 text-yellow" /> {{ $t('general.cards', numberOfCardsToFund) }}
              </ParagraphDefault>
              <SatsAmountSelector
                class="my-4"
                :label="t('setFunding.form.amountLabel')"
                :amount-sats="amountPerCard"
                :selected-currency="selectedCurrency"
                :rate-btc-fiat="rateBtcEur"
                :min="21"
                :max="2100000"
                :disabled="creatingInvoice"
                @update:amount-sats="amountPerCard = $event"
                @update:selected-currency="selectedCurrency = $event"
              />
              <small v-if="amountPerCard < 210" class="block leading-tight mb-3 text-sm text-yellow-dark">
                {{ t('setFunding.form.smallAmountWarning') }}
              </small>
              <AmountDisplayForCalculation
                :amount-sats="totalAmountNet"
                :selected-currency="selectedCurrency"
                :rate-btc-fiat="rateBtcEur"
                :label="$t('setFunding.form.totalAmountLabel')"
              />
              <AmountDisplayForCalculation
                :amount-sats="totalFeeAmount"
                :selected-currency="selectedCurrency"
                :rate-btc-fiat="rateBtcEur"
              >
                <template #label>
                  {{ $t('general.fee') }}
                  <TooltipDefault
                    v-if="fee != null"
                    class="ms-1"
                    :content="$t('funding.form.feeInfo', { fee: `${100 * fee}` })"
                  >
                    <IconInfoCircle class="w-4 text-yellow" />
                  </TooltipDefault>
                </template>
              </AmountDisplayForCalculation>
              <AmountDisplayForCalculation
                strong
                :amount-sats="totalAmountIncludingFee"
                :selected-currency="selectedCurrency"
                :rate-btc-fiat="rateBtcEur"
                :label="$t('general.totalIncludingFee')"
              />
              <hr class="my-8">
              <TextField
                v-model="text"
                :label="$t('funding.form.textPlaceholder')"
                :placeholder="$t('funding.form.textPlaceholder')"
                class="w-full my-4"
                fiat-currency="EUR"
                :disabled="creatingInvoice"
              />
              <TextField
                v-model="note"
                :label="$t('cards.status.labelNote')"
                :placeholder="$t('setFunding.form.notePlaceholder')"
                class="w-full my-4"
                :disabled="creatingInvoice"
              />
              <div class="flex flex-col items-center mt-4">
                <ButtonDefault
                  type="submit"
                  :disabled="creatingInvoice"
                >
                  {{ t('funding.form.button') }}
                </ButtonDefault>
              </div>
            </form>
          </div>
        </div>
        <div
          v-if="userErrorMessage != null"
          class="mt-4"
        >
          <ParagraphDefault class="text-red-500" dir="ltr">
            {{ userErrorMessage }}
          </ParagraphDefault>
        </div>
      </div>
    </CenterContainer>
  </TheLayout>
</template>

<script setup lang="ts">
import axios from 'axios'
import { onBeforeMount, ref, reactive, computed, onBeforeUnmount } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'

import type { Set, Settings } from '@shared/data/api/Set'
import { FEE_PERCENTAGE } from '@shared/constants'
import { calculateFeeForCard } from '@shared/modules/feeCalculation'

import TheLayout from '@/components/layout/TheLayout.vue'
import CenterContainer from '@/components/layout/CenterContainer.vue'
import HeadlineDefault from '@/components/typography/HeadlineDefault.vue'
import ParagraphDefault from '@/components/typography/ParagraphDefault.vue'
import IconAnimatedLoadingWheelDeprecated from '@/components/icons/IconAnimatedLoadingWheelDeprecated.vue'
import ButtonDefault from '@/components/buttons/ButtonDefault.vue'
import ButtonWithTooltip from '@/components/ButtonWithTooltip.vue'
import LightningQrCode from '@/components/LightningQrCode.vue'
import SatsAmountSelector from '@/components/SatsAmountSelector.vue'
import { rateBtcEur } from '@/modules/rateBtcFiat'
import { loadCardStatus } from '@/modules/loadCardStatus'
import hashSha256 from '@/modules/hashSha256'
import { getDefaultSettings, decodeCardsSetSettings } from '@/stores/cardsSets'
import { BACKEND_API_ORIGIN } from '@/constants'
import BackLinkDeprecated from '@/components/BackLinkDeprecated.vue'
import IconTipCardSet from '@/components/icons/IconTipCardSet.vue'
import type { SelectedCurrency } from '@/modules/useAmountConversion'
import TextField from '@/components/forms/TextField.vue'
import AmountDisplayForCalculation from '@/components/AmountDisplayForCalculation.vue'
import TooltipDefault from '@/components/TooltipDefault.vue'
import IconInfoCircle from '@/components/icons/IconInfoCircle.vue'
import AmountDisplayFinalSum from '@/components/AmountDisplayFinalSum.vue'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()

const fee = ref<number | null>(FEE_PERCENTAGE)
const selectedCurrency = ref<SelectedCurrency>('sats')
const initializing = ref(true)
const settings = reactive(getDefaultSettings())
const amountPerCard = ref(2100)
const text = ref(t('cards.settings.defaults.invoiceText'))
const textIsDirty = ref(false)
const note = ref<string>()
const noteIsDirty = ref(false)
const userErrorMessage = ref<string>()
const set = ref<Set>()
const cardIndicesNotUnfunded = ref<number[]>([])
const creatingInvoice = ref(false)
const pollingTimeout = ref<NodeJS.Timeout>()

const funded = computed(() => set.value?.invoice?.paid != null)
const invoice = computed(() => set.value?.invoice?.payment_request)
const invoiceAmountNet = computed(() => set.value?.invoice?.amount)
const invoiceFeeAmount = computed(() => set.value?.invoice?.feeAmount)
const invoiceAmount = computed(() => invoiceAmountNet.value != null && invoiceFeeAmount.value ? invoiceAmountNet.value + invoiceFeeAmount.value : undefined)
const invoiceExpired = computed(() => !!set.value?.invoice?.expired)

const loadSetData = async () => {
  try {
    const response = await axios.get(`${BACKEND_API_ORIGIN}/api/set/${route.params.setId}`)
    if (response.data.status === 'success' && response.data.data != null) {
      set.value = response.data.data
    }
  } catch(error) {
    set.value = undefined
    console.error(error)
  }

  const cardIndicesNotUnfundedLocal: number[] = []
  try {
    await Promise.all([...new Array(settings.numberOfCards).keys()].map(async (index) => {
      const cardHash = await hashSha256(`${route.params.setId}/${index}`)
      const { status } = await loadCardStatus(cardHash)
      if (status !== 'unfunded') {
        cardIndicesNotUnfundedLocal.push(index)
      }
    }))
    cardIndicesNotUnfunded.value = cardIndicesNotUnfundedLocal
  } catch (error) {
    console.error(error)
  }
  initializing.value = false

  pollingTimeout.value = setTimeout(loadSetData, 10 * 1000)
}

const onVisibilityChange = () => {
  if (document.visibilityState !== 'visible') {
    return
  }
  loadSetData()
}

onBeforeMount(() => {
  const settingsEncoded = String(route.params.settings)
  let settingsDecoded: Settings | undefined = undefined
  try {
    settingsDecoded = decodeCardsSetSettings(settingsEncoded)
  } catch {
    // do nothing
  }
  Object.assign(settings, settingsDecoded)

  loadSetData()
  document.addEventListener('visibilitychange', onVisibilityChange)
})

onBeforeUnmount(() => {
  if (pollingTimeout.value != null) {
    clearTimeout(pollingTimeout.value)
  }
  document.removeEventListener('visibilitychange', onVisibilityChange)
})

const numberOfCardsToFund = computed<number>(() => {
  if (set.value?.invoice?.fundedCards != null) {
    return set.value.invoice.fundedCards.length
  }
  return settings.numberOfCards - cardIndicesNotUnfunded.value.length
})
const totalAmountNet = computed<number>(() => amountPerCard.value * numberOfCardsToFund.value)
const totalFeeAmount = computed(() => (calculateFeeForCard(amountPerCard.value)) * numberOfCardsToFund.value)
const totalAmountIncludingFee = computed(() => totalAmountNet.value + totalFeeAmount.value)

const cardIndicesToFund = computed<number[]>(() => [...new Array(settings.numberOfCards).keys()].filter(index => !cardIndicesNotUnfunded.value.includes(index)))

const createInvoice = async () => {
  creatingInvoice.value = true
  try {
    const response = await axios.post(
      `${BACKEND_API_ORIGIN}/api/set/invoice/${route.params.setId}`,
      {
        amountPerCard: amountPerCard.value,
        text: text.value,
        note: note.value,
        cardIndices: cardIndicesToFund.value,
      },
    )
    if (response.data.status === 'success' && response.data.data != null) {
      set.value = response.data.data
      userErrorMessage.value = undefined
    }
  } catch(error) {
    console.error(error)
  }
  creatingInvoice.value = false

  if (invoice.value == null) {
    userErrorMessage.value = 'Unable to create funding invoice. Please try again later.'
  }
}

const resetInvoice = async () => {
  try {
    const response = await axios.delete(
      `${BACKEND_API_ORIGIN}/api/set/invoice/${route.params.setId}`)
    if (response.data.status === 'success') {
      set.value = undefined
      amountPerCard.value = 2100
      userErrorMessage.value = undefined
      creatingInvoice.value = false
      text.value = t('cards.settings.defaults.invoiceText')
      textIsDirty.value = false
      note.value = undefined
      noteIsDirty.value = false
      cardIndicesNotUnfunded.value = []
    }
  } catch(error) {
    console.error(error)
    userErrorMessage.value = 'Unable to reset set. Please try again later.'
  }
}

const cardsHref = computed(() => {
  if (route.name !== 'set-funding') {
    return undefined
  }
  const targetRoute = router.resolve({
    name: 'cards',
    params: {
      lang: route.params.lang,
      setId: route.params.setId,
      settings: route.params.settings,
    },
  })
  return targetRoute.href
})
</script>
