<template>
  <div class="flex flex-col flex-1 mx-auto w-full max-w-md">
    <BackLink class="pt-4 px-4" />
    <div
      v-if="initializing"
      class="flex justify-center flex-1 mt-8 px-4"
    >
      <AnimatedLoadingWheel />
    </div>
    <div 
      v-else
      class="flex-1 mt-8 px-4"
    >
      <HeadlineDefault
        level="h1"
        class="mt-10"
      >
        {{
          funded
            ? t('setFunding.headlineFunded') 
            : t('setFunding.headline', { setName: settings.setName })
        }}
      </HeadlineDefault>
      <div v-if="invoice != null">
        <ParagraphDefault>
          <I18nT
            v-if="funded"
            keypath="setFunding.textFunded"
          >
            <template #amountAndUnit>
              <strong
                v-if="invoiceAmount != null"
                class="inline-block"
              >
                {{ t('setFunding.amountAndUnit', { amount: formatNumber(invoiceAmount / (100 * 1000 * 1000), 8, 8) }) }}
              </strong>
            </template>
          </I18nT>
          <I18nT
            v-else
            keypath="setFunding.invoiceText"
          >
            <template #amount>
              <strong>{{ invoiceAmount }}</strong>
            </template>
          </I18nT>
        </ParagraphDefault>
        <LightningQrCode
          :value="invoice"
          :success="funded"
          :error="invoiceExpired ? t('setFunding.invoiceExpired') : undefined"
        />
        <p
          v-if="invoiceExpired"
          class="mb-4"
        >
          {{ t('setFunding.invoiceExpired') }}
        </p>
        <div class="flex justify-center">
          <ButtonWithTooltip
            type="submit"
            variant="outline"
            :disabled="funded"
            :tooltip="funded ? t('setFunding.resetDisabledTooltip') : undefined"
            @click="resetInvoice"
          >
            {{ t('setFunding.resetInvoice') }} 
          </ButtonWithTooltip>
        </div>
      </div>
      <div v-else>
        <ParagraphDefault class="mb-8">
          <I18nT keypath="setFunding.text">
            <template #numberOfCardsToFund>{{ numberOfCardsToFund }}</template>
            <template #amountAndUnit>
              <strong class="inline-block">
                {{ t('setFunding.amountAndUnit', { amount: formatNumber(amountTotal / (100 * 1000 * 1000), 8, 8) }) }}
              </strong>
            </template>
          </I18nT>
        </ParagraphDefault>
        <form @submit.prevent="createInvoice">
          <label class="block mb-2">
            <SatsAmountSelector
              :amount-sats="amountPerCard"
              :rate-btc-eur="rateBtcEur"
              :min="210"
              :disabled="creatingInvoice"
              @update="amountPerCard = $event"
            />
            <small class="block">({{ t('setFunding.form.amountHint') }})</small>
          </label>
          <label class="block mb-2">
            <input
              v-model="text"
              type="text"
              class="w-full border my-1 px-3 py-2 focus:outline-none"
              :disabled="creatingInvoice"
            >
            <small class="block">({{ t('setFunding.form.textHint') }})</small>
          </label>
          <label class="block mb-2">
            <input
              v-model="note"
              type="text"
              class="w-full border my-1 px-3 py-2 focus:outline-none"
              :placeholder="t('setFunding.form.notePlaceholder')"
              :disabled="creatingInvoice"
            >
            <small class="block">({{ t('setFunding.form.noteHint') }})</small>
          </label>
          <div class="flex flex-col items-center mt-4">
            <ButtonDefault
              type="submit"
              :disabled="creatingInvoice"
            >
              {{ t('setFunding.form.button') }}
            </ButtonDefault>
          </div>
        </form>
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
  </div>
</template>

<script setup lang="ts">
import axios from 'axios'
import { onBeforeMount, ref, reactive, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'

import I18nT from '@/modules/I18nT'
import BackLink from '@/components/BackLink.vue'
import HeadlineDefault from '@/components/typography/HeadlineDefault.vue'
import ParagraphDefault from '@/components/typography/ParagraphDefault.vue'
import AnimatedLoadingWheel from '@/components/AnimatedLoadingWheel.vue'
import ButtonDefault from '@/components/ButtonDefault.vue'
import ButtonWithTooltip from '@/components/ButtonWithTooltip.vue'
import LightningQrCode from '@/components/LightningQrCode.vue'
import SatsAmountSelector from '@/components/SatsAmountSelector.vue'
import formatNumber from '@/modules/formatNumber'
import { rateBtcEur } from '@/modules/rateBtcEur'
import { BACKEND_API_ORIGIN } from '@/constants'
import { type Settings, initialSettings, decodeCardsSetSettings } from '@/modules/cardsSets'

const { t } = useI18n()
const route = useRoute()

const initializing = ref(true)
const settings = reactive({ ...initialSettings })
const amountPerCard = ref(2100)
const text = ref('Have fun with Bitcoin :)')
const textIsDirty = ref(false)
const note = ref<string>()
const noteIsDirty = ref(false)
const userErrorMessage = ref<string>()
const invoice = ref<string>()
const invoiceAmount = ref<number>()
const invoiceExpired = ref(false)
const funded = ref(false)
const creatingInvoice = ref(false)

const loadSetData = async () => {
  const settingsEncoded = String(route.params.settings)
  let settingsDecoded: Settings | undefined = undefined
  try {
    settingsDecoded = decodeCardsSetSettings(settingsEncoded)
  } catch (error) {
    // do nothing
  }
  Object.assign(settings, settingsDecoded)
  
  try {
    const response = await axios.get(`${BACKEND_API_ORIGIN}/api/set/${route.params.setId}`)
    if (
      response.data.status === 'success'
      && response.data.data != null
      && typeof response.data.data.invoice === 'string'
    ) {
      invoice.value = response.data.data.invoice
      console.log('TODO : check if there are cards that are already funded/used/etc')
    }
  } catch(error) {
    console.error(error)
  }
  initializing.value = false

  setTimeout(loadSetData, 10 * 1000)
}
onBeforeMount(loadSetData)

const numberOfCardsToFund = computed<number>(() => settings.numberOfCards)
const amountTotal = computed<number>(() => amountPerCard.value * numberOfCardsToFund.value)

const createInvoice = async () => {
  creatingInvoice.value = true
  try {
    const response = await axios.post(
      `${BACKEND_API_ORIGIN}/api/set/invoice/${route.params.setId}`,
      {
        amount: amountTotal.value,
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
      invoice.value = undefined
      funded.value = false
      amountPerCard.value = 2100
      userErrorMessage.value = undefined
      creatingInvoice.value = false
      invoiceExpired.value = false
      text.value = 'Have fun with Bitcoin :)'
      textIsDirty.value = false
      note.value = undefined
      noteIsDirty.value = false
    }
  } catch(error) {
    console.error(error)
    userErrorMessage.value = 'Unable to reset set. Please try again later.'
  }
}
</script>
