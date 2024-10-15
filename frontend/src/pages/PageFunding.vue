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
        v-else-if="setFunding"
        class="flex-1 mt-8"
        data-test="funding-set"
      >
        <HeadlineDefault
          level="h1"
          class="mt-10"
        >
          {{ t('funding.headlineSetFunding') }}
        </HeadlineDefault>
        <p>
          {{ t('funding.textSetFunding') }}
        </p>
      </div>
      <div
        v-else
        class="flex-1 mt-8"
      >
        <HeadlineDefault
          level="h1"
          class="mt-10"
        >
          {{
            usedDate != null
              ? t('funding.headlineUsed')
              : funded
                ? t('funding.headlineFunded')
                : t('funding.headline')
          }}
        </HeadlineDefault>
        <ParagraphDefault
          v-if="invoice == null && !shared && !lnurlp"
          class="mb-8"
        >
          {{ t('funding.text') }}
        </ParagraphDefault>
        <div v-if="invoice != null" data-test="funding-invoice">
          <ParagraphDefault>
            <I18nT
              v-if="funded || usedDate != null"
              :keypath="usedDate != null ? 'funding.textUsed' : 'funding.textFunded'"
            >
              <template #amountAndUnit>
                <strong v-if="invoiceAmount != null" class="inline-block">
                  {{ t('funding.amountAndUnit', { amount: formatNumber(invoiceAmount / (100 * 1000 * 1000), 8, 8)}) }}
                </strong>
              </template>
            </I18nT>
            <I18nT v-else keypath="funding.invoiceText">
              <template #amount>
                <strong>{{ invoiceAmount }}</strong>
              </template>
            </I18nT>
          </ParagraphDefault>
          <LightningQrCode
            class="my-7"
            :value="invoice"
            :success="funded"
            :error="invoiceExpired ? t('funding.invoiceExpired') : undefined"
          />
          <p v-if="invoiceExpired" class="mb-4">
            {{ t('funding.invoiceExpired') }}
          </p>
          <div class="flex justify-center">
            <ButtonWithTooltip
              type="submit"
              variant="outline"
              :disabled="funded"
              :tooltip="funded ? t('funding.resetDisabledTooltip') : undefined"
              @click="resetInvoice"
            >
              {{ t('funding.resetInvoice') }}
            </ButtonWithTooltip>
          </div>
        </div>
        <div v-else-if="shared" data-test="funding-shared">
          <ParagraphDefault class="mb-8">
            <I18nT keypath="funding.shared.text">
              <template #buttonFinish>
                "{{ t('funding.shared.buttonFinish') }}"
              </template>
            </I18nT>
          </ParagraphDefault>
          <div class="mb-12">
            <LightningQrCode
              class="my-7"
              :value="lnurl"
              :success="funded"
              :error="lnurlpExpired ? (amount > 0 ? t('funding.lnurlpFundedExpired') : t('funding.lnurlpExpired')) : undefined"
            />
            <p v-if="lnurlpExpired" class="mb-4">
              {{ amount > 0 ? t('funding.lnurlpFundedExpired') : t('funding.lnurlpExpired') }}
            </p>
          </div>
          <ParagraphDefault v-if="funded">
            <I18nT :keypath="usedDate != null ? 'funding.textUsed' : 'funding.textFunded'">
              <template #amountAndUnit>
                <strong class="inline-block">
                  {{ t('funding.amountAndUnit', { amount: formatNumber(amount / (100 * 1000 * 1000), 8, 8)}) }}
                </strong>
              </template>
            </I18nT>
          </ParagraphDefault>
          <ParagraphDefault v-else-if="amount === 0">
            {{ t('funding.shared.textEmpty') }}
          </ParagraphDefault>
          <ParagraphDefault v-else>
            <I18nT keypath="funding.shared.textPartiallyFunded">
              <template #amountAndUnit>
                <strong class="inline-block">
                  {{ t('funding.amountAndUnit', { amount: formatNumber(amount / (100 * 1000 * 1000), 8, 8)}) }}
                </strong>
              </template>
            </I18nT>
          </ParagraphDefault>
          <div v-if="!funded">
            <label class="block mb-2">
              <input
                v-model="text"
                type="text"
                class="w-full border my-1 px-3 py-2 focus:outline-none"
                :disabled="creatingInvoice"
                @input="updateText"
              >
              <small class="block">({{ t('funding.form.textHint') }})</small>
            </label>
            <label class="block mb-2">
              <input
                v-model="note"
                type="text"
                class="w-full border my-1 px-3 py-2 focus:outline-none"
                :placeholder="t('funding.form.notePlaceholder')"
                :disabled="creatingInvoice"
                @input="updateNote"
              >
              <small class="block">({{ t('funding.form.noteHint') }})</small>
            </label>
          </div>
          <div
            class="flex flex-col items-center mt-4"
          >
            <ButtonWithTooltip
              variant="outline"
              :disabled="amount > 0 || finishingShared || funded"
              :tooltip="amount > 0 ? t('funding.resetDisabledTooltip') : undefined"
              @click="resetInvoice"
            >
              {{ t('funding.resetInvoice') }}
            </ButtonWithTooltip>
            <ButtonWithTooltip
              type="submit"
              :disabled="amount === 0 || finishingShared || funded"
              :tooltip="amount === 0 ? t('funding.shared.finishDisabledTooltip') : undefined"
              @click="finishShared"
            >
              {{ t('funding.shared.buttonFinish') }}
            </ButtonWithTooltip>
          </div>
        </div>
        <div v-else-if="lnurlp" data-test="funding-lnurlp">
          <ParagraphDefault v-if="funded">
            <I18nT :keypath="usedDate != null ? 'funding.textUsed' : 'funding.textFunded'">
              <template #amountAndUnit>
                <strong class="inline-block">
                  {{ t('funding.amountAndUnit', { amount: formatNumber(amount / (100 * 1000 * 1000), 8, 8)}) }}
                </strong>
              </template>
            </I18nT>
          </ParagraphDefault>
          <ParagraphDefault v-else>
            <I18nT keypath="funding.lnurlp.text">
              <template #buttonOpenInWallet>
                "{{ t('lightningQrCode.buttonOpenInWallet') }}"
              </template>
            </I18nT>
          </ParagraphDefault>
          <LightningQrCode
            class="my-7"
            :value="lnurl"
            :success="funded"
            :error="lnurlpExpired ? t('funding.lnurlpExpired') : undefined"
          />
          <p v-if="lnurlpExpired" class="mb-4">
            {{ t('funding.lnurlpExpired') }}
          </p>
          <div class="mb-4">
            <label class="block mb-2">
              <input
                v-model="text"
                type="text"
                class="w-full border my-1 px-3 py-2 focus:outline-none"
                :disabled="funded"
                @input="updateText"
              >
              <small class="block">({{ t('funding.form.textHint') }})</small>
            </label>
            <label class="block mb-2">
              <input
                v-model="note"
                type="text"
                class="w-full border my-1 px-3 py-2 focus:outline-none"
                :placeholder="t('funding.form.notePlaceholder')"
                :disabled="funded"
                @input="updateNote"
              >
              <small class="block">({{ t('funding.form.noteHint') }})</small>
            </label>
          </div>
          <div class="flex justify-center">
            <ButtonWithTooltip
              variant="outline"
              :disabled="funded"
              :tooltip="funded ? t('funding.resetDisabledTooltip') : undefined"
              @click="resetInvoice"
            >
              {{ t('funding.resetInvoice') }}
            </ButtonWithTooltip>
          </div>
        </div>
        <div v-else>
          <form @submit.prevent="createInvoice">
            <label class="block mb-2">
              <SatsAmountSelector
                :amount-sats="amount"
                :rate-btc-eur="rateBtcEur"
                :min="210"
                :max="2100000"
                :disabled="creatingInvoice"
                @update="amount = $event"
              />
            </label>
            <label class="block mb-2">
              <input
                v-model="text"
                type="text"
                class="w-full border my-1 px-3 py-2 focus:outline-none"
                :disabled="creatingInvoice"
              >
              <small class="block">({{ t('funding.form.textHint') }})</small>
            </label>
            <label class="block mb-2">
              <input
                v-model="note"
                type="text"
                class="w-full border my-1 px-3 py-2 focus:outline-none"
                :placeholder="t('funding.form.notePlaceholder')"
                :disabled="creatingInvoice"
              >
              <small class="block">({{ t('funding.form.noteHint') }})</small>
            </label>
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
        <div v-if="userErrorMessage != null">
          <ParagraphDefault class="text-red-500" dir="ltr">
            {{ userErrorMessage }}
          </ParagraphDefault>
        </div>
        <div
          v-if="funded"
          class="mt-24"
        >
          <CardStatus
            :status="cardStatus"
            :funded-date="cardFundedDate"
            :used-date="usedDate"
            :shared="shared"
            :amount="invoiceAmount || amount || undefined"
            :note="note || undefined"
            :viewed="viewed"
            :url="landingPageUrl"
          />
        </div>
      </div>
      <LinkDefault
        v-if="!initializing && invoice == null && !shared && !funded && !setFunding"
        class="mt-12"
        :disabled="creatingInvoice"
        @click.prevent="makeShared"
      >
        {{ t('funding.shared.buttonMakeShared') }}
      </LinkDefault>
    </CenterContainer>
  </TheLayout>
</template>

<script setup lang="ts">
import axios from 'axios'
import debounce from 'lodash.debounce'
import { computed, onBeforeMount, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'

import LNURL from '@shared/modules/LNURL/LNURL'

import HeadlineDefault from '@/components/typography/HeadlineDefault.vue'
import LinkDefault from '@/components/typography/LinkDefault.vue'
import ParagraphDefault from '@/components/typography/ParagraphDefault.vue'
import IconAnimatedLoadingWheelDeprecated from '@/components/icons/IconAnimatedLoadingWheelDeprecated.vue'
import ButtonDefault from '@/components/buttons/ButtonDefault.vue'
import ButtonWithTooltip from '@/components/ButtonWithTooltip.vue'
import LightningQrCode from '@/components/LightningQrCode.vue'
import SatsAmountSelector from '@/components/SatsAmountSelector.vue'
import CardStatus from '@/components/CardStatus.vue'
import formatNumber from '@/modules/formatNumber'
import { loadCardStatus } from '@/modules/loadCardStatus'
import { rateBtcEur } from '@/modules/rateBtcFiat'
import useLandingPages from '@/modules/useLandingPages'
import { BACKEND_API_ORIGIN } from '@/constants'

import TheLayout from '@/components/layout/TheLayout.vue'
import CenterContainer from '@/components/layout/CenterContainer.vue'
import BackLinkDeprecated from '@/components/BackLinkDeprecated.vue'

const DEFAULT_AMOUNT = 2100

const { t } = useI18n()
const route = useRoute()

const initializing = ref(true)
const lnurlp = ref(false)
const amount = ref(DEFAULT_AMOUNT)
const text = ref(t('cards.settings.defaults.invoiceText'))
const textIsDirty = ref(false)
const note = ref<string>()
const noteIsDirty = ref(false)
const userErrorMessage = ref<string>()
const invoice = ref<string>()
const invoiceAmount = ref<number>()
const invoiceExpired = ref(false)
const funded = ref(false)
const creatingInvoice = ref(false)
const shared = ref(false)
const finishingShared = ref(false)
const lnurlpExpired = ref(false)
const cardStatus = ref<string | undefined>()
const cardFundedDate = ref<number | undefined>()
const usedDate = ref<number | undefined>()
const viewed = ref(false)
const setFunding = ref(false)

const lnurl = computed(() => LNURL.encode(`${BACKEND_API_ORIGIN}/api/lnurl/${route.params.cardHash}`))

const loadLnurlData = async () => {
  const { status, fundedDate, card } = await loadCardStatus(String(route.params.cardHash))

  cardStatus.value = status || undefined
  cardFundedDate.value = fundedDate || undefined
  usedDate.value = card?.used || undefined
  lnurlp.value = card?.lnurlp != null
  shared.value = !!card?.lnurlp?.shared
  invoiceAmount.value = card?.invoice?.amount != null ? card.invoice.amount : undefined
  invoice.value = card?.invoice?.payment_request != null ? card.invoice.payment_request : undefined
  invoiceExpired.value = !!card?.invoice?.expired
  lnurlpExpired.value = !!card?.lnurlp?.expired
  if (!!card?.text && !textIsDirty.value) {
    text.value = card.text
  }
  if (!!card?.note && !noteIsDirty.value) {
    note.value = card.note
  }
  funded.value = status === 'funded' || status === 'used'
  viewed.value = card?.landingPageViewed != null
  setFunding.value = card?.setFunding != null
  if (typeof card?.lnurlp?.amount === 'number') {
    amount.value = card.lnurlp.amount
  } else if (card?.lnurlp?.shared) {
    amount.value = 0
  } else if (typeof card?.setFunding?.amount === 'number') {
    amount.value = card.setFunding.amount
  }

  initializing.value = false

  setTimeout(loadLnurlData, 10 * 1000)
}

onBeforeMount(loadLnurlData)

const createInvoice = async () => {
  creatingInvoice.value = true
  try {
    const response = await axios.post(
      `${BACKEND_API_ORIGIN}/api/invoice/create/${route.params.cardHash}`,
      {
        amount: amount.value,
        text: text.value,
        note: note.value,
      },
    )
    if (response.data.status === 'success' && typeof response.data.data === 'string') {
      invoice.value = response.data.data
      userErrorMessage.value = undefined
    }
  } catch(error) {
    console.error(error)
  }
  await loadLnurlData()
  creatingInvoice.value = false

  if (invoice.value == null) {
    userErrorMessage.value = 'Unable to create funding invoice. Please try again later.'
  }
}

const resetInvoice = async () => {
  try {
    const response = await axios.delete(`${BACKEND_API_ORIGIN}/api/invoice/delete/${route.params.cardHash}`)
    if (response.data.status === 'success') {
      invoice.value = undefined
      shared.value = false
      funded.value = false
      amount.value = DEFAULT_AMOUNT
      userErrorMessage.value = undefined
      creatingInvoice.value = false
      finishingShared.value = false
      invoiceExpired.value = false
      text.value = t('cards.settings.defaults.invoiceText')
      textIsDirty.value = false
      note.value = undefined
      noteIsDirty.value = false
      lnurlp.value = false
      lnurlpExpired.value = false
    }
  } catch(error) {
    console.error(error)
    userErrorMessage.value = 'Unable to reset TipCard. Please try again later.'
  }
}

const makeShared = async () => {
  creatingInvoice.value = true

  try {
    const response = await axios.post(
      `${BACKEND_API_ORIGIN}/api/lnurlp/create/${route.params.cardHash}`,
      {
        text: text.value,
        note: note.value,
      },
    )
    if (response.data.status === 'success') {
      amount.value = 0
      shared.value = true
      userErrorMessage.value = undefined
    }
  } catch(error) {
    console.error(error)
  }
  if (shared.value !== true) {
    userErrorMessage.value = 'Unable to make share funding.'
  }

  creatingInvoice.value = false
}

const updateTextAndNoteForSharedCard = debounce(async () => {
  if (!shared.value && !lnurlp.value) {
    return
  }
  const newText = text.value
  const newNote = note.value
  try {
    await axios.post(
      `${BACKEND_API_ORIGIN}/api/lnurlp/update/${route.params.cardHash}`,
      {
        text: newText,
        note: newNote,
      },
    )
  } catch(error) {
    console.error(error)
  }
  if (text.value === newText) {
    textIsDirty.value = false
  }
  if (note.value === newNote) {
    noteIsDirty.value = false
  }
}, 300)
const updateText = () => {
  textIsDirty.value = true
  updateTextAndNoteForSharedCard()
}
const updateNote = () => {
  noteIsDirty.value = true
  updateTextAndNoteForSharedCard()
}

const finishShared = async () => {
  finishingShared.value = true
  try {
    const response = await axios.post(
      `${BACKEND_API_ORIGIN}/api/lnurlp/finish/${route.params.cardHash}`,
      {
        text: text.value,
        note: note.value,
      },
    )
    if (response.data.status === 'success') {
      funded.value = true
    }
  } catch(error) {
    console.error(error)
  }
  finishingShared.value = false
  if (!funded.value) {
    userErrorMessage.value = 'Unable to finish shared funding.'
  }
}

const { getLandingPageUrlWithCardHash } = useLandingPages()
const landingPageUrl = computed(
  () => typeof route.params.cardHash === 'string'
    ? getLandingPageUrlWithCardHash(route.params.cardHash)
    : '',
)
</script>
