<template>
  <div class="flex flex-col flex-1 mx-auto w-full max-w-md">
    <div
      v-if="backlink != null"
      class="pt-4 px-4"
    >
      <LinkDefault
        :href="backlink"
        @click.prevent="$router.back()"
      >
        <i class="bi bi-caret-left-fill" />{{ t('general.back') }}
      </LinkDefault>
    </div>
    <div class="flex-1 mt-8 px-4">
      <HeadlineDefault
        level="h1"
        class="mt-10"
      >
        {{ t('funding.headline') }}
      </HeadlineDefault>
      <ParagraphDefault
        v-if="invoice == null && !multi"
        class="mb-8"
      >
        {{ t('funding.text') }}
      </ParagraphDefault>
      <div v-if="invoice != null">
        <ParagraphDefault>
          <Translation keypath="funding.invoiceText">
            <template #amount>
              <strong>{{ invoiceAmount }}</strong>
            </template>
          </Translation>
        </ParagraphDefault>
        <LightningQrCode
          :value="invoice"
          :success="funded"
        />
      </div>
      <div v-else-if="multi">
        <ParagraphDefault class="mb-8">
          {{ t('funding.multi.text') }} 
        </ParagraphDefault>
        <div class="mb-12">
          <LightningQrCode
            :value="lnurl"
            :success="funded"
          />
        </div>
        <ParagraphDefault v-if="funded">
          <Translation keypath="funding.multi.textFunded">
            <template #amountAndUnit>
              <strong class="inline-block">
                {{ t('funding.multi.amountAndUnit', { amount: formatNumber(amount / (100 * 1000 * 1000), 8, 8)}) }}
              </strong>
            </template>
          </Translation>
        </ParagraphDefault>
        <ParagraphDefault v-else-if="amount === 0">
          {{ t('funding.multi.textEmpty') }} 
        </ParagraphDefault>
        <ParagraphDefault v-else>
          <Translation keypath="funding.multi.textPartiallyFunded">
            <template #amountAndUnit>
              <strong class="inline-block">
                {{ t('funding.multi.amountAndUnit', { amount: formatNumber(amount / (100 * 1000 * 1000), 8, 8)}) }}
              </strong>
            </template>
          </Translation>
        </ParagraphDefault>
        <div
          v-if="!funded"
          class="flex flex-col items-center mt-4"
        >
          <ButtonDefault
            type="submit"
            :disabled="amount === 0 || finishingMulti || funded"
            @click="finishMulti"
          >
            {{ t('funding.multi.buttonFinish') }} 
          </ButtonDefault>
        </div>
      </div>
      <div v-else>
        <form @submit.prevent="fund">
          <label class="block mb-2">
            <SatsAmountSelector
              :amount-sats="amount"
              :rate-btc-eur="rateBtcEur"
              :min="500"
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
        <ParagraphDefault class="text-red-500">
          {{ userErrorMessage }}
        </ParagraphDefault>
      </div>
    </div>
    <LinkDefault
      v-if="invoice == null && !multi"
      class="mt-12 px-4"
      :disabled="creatingInvoice"
      @click.prevent="multiFund"
    >
      {{ t('funding.multi.buttonMakeMulti') }} 
    </LinkDefault>
  </div>
</template>

<script setup lang="ts">
import axios from 'axios'
import { computed, onBeforeMount, ref } from 'vue'
import { useI18n, Translation } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'

import HeadlineDefault from '@/components/typography/HeadlineDefault.vue'
import LinkDefault from '@/components/typography/LinkDefault.vue'
import ParagraphDefault from '@/components/typography/ParagraphDefault.vue'
import ButtonDefault from '@/components/ButtonDefault.vue'
import LightningQrCode from '@/components/LightningQrCode.vue'
import SatsAmountSelector from '@/components/SatsAmountSelector.vue'
import formatNumber from '@/modules/formatNumber'
import { loadCardStatus } from '@/modules/loadCardStatus'
import { rateBtcEur } from '@/modules/rateBtcEur'
import { BACKEND_API_ORIGIN } from '@/constants'
import { encodeLnurl } from '@root/modules/lnurlHelpers'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()

const amount = ref(1000)
const text = ref('Have fun with Bitcoin :)')
const userErrorMessage = ref<string>()
const invoice = ref<string>()
const invoiceAmount = ref<number>()
const funded = ref(false)
const creatingInvoice = ref(false)
const multi = ref(false)
const finishingMulti = ref(false)

const backlink = computed(() => {
  try {
    return new URL(document.referrer).origin === location.origin ? document.referrer : null
  } catch (error) {
    return null
  }
})

const lnurl = computed(() => encodeLnurl(`${BACKEND_API_ORIGIN}/api/lnurl/${route.params.cardHash}`))

const loadLnurlData = async () => {
  const { status, card } = await loadCardStatus(String(route.params.cardHash))

  if (card?.lnurlp?.multi) {
    amount.value = typeof card.lnurlp.amount === 'number' ? card.lnurlp.amount : 0
    multi.value = true
  }
  if (card?.invoice?.amount != null) {
    invoiceAmount.value = card.invoice.amount
  }
  if (card?.invoice?.payment_request != null) {
    invoice.value = card.invoice.payment_request
  }
  if (
    status === 'funded'
    && (invoice.value != null || multi.value)
  ) {
    funded.value = true
  } else if (status !== 'unfunded') {
    router.replace({
      name: 'landing',
      query: { lightning: lnurl.value.toUpperCase() },
    })
    return
  }

  setTimeout(loadLnurlData, 10 * 1000)
}

onBeforeMount(loadLnurlData)

const fund = async () => {
  creatingInvoice.value = true
  try {
    const response = await axios.post(
      `${BACKEND_API_ORIGIN}/api/invoice/create/${route.params.cardHash}`,
      {
        amount: amount.value,
        text: text.value,
      },
    )
    if (response.data.status === 'success' && typeof response.data.data === 'string') {
      invoice.value = response.data.data
      userErrorMessage.value = undefined
    }
  } catch(error) {
    alert('We are building our Tip Cards on the shoulders of giants, in this case it\'s LNBits. The legend.lnbits.com server is currently not reachable. Please try again later.')
    console.error(error)
  }
  creatingInvoice.value = false
  
  if (invoice.value == null) {
    userErrorMessage.value = 'Error when creating funding invoice.'
  }
}

const multiFund = async () => {
  creatingInvoice.value = true

  try {
    const response = await axios.post(`${BACKEND_API_ORIGIN}/api/lnurlp/create/${route.params.cardHash}`)
    if (response.data.status === 'success') {
      amount.value = 0
      multi.value = true
      userErrorMessage.value = undefined
    }
  } catch(error) {
    console.error(error)
  }
  if (multi.value !== true) {
    userErrorMessage.value = 'Unable to make multifund.'
  }
}
const finishMulti = async () => {
  finishingMulti.value = true
  try {
    const response = await axios.post(`${BACKEND_API_ORIGIN}/api/lnurlp/finish/${route.params.cardHash}`)
    if (response.data.status === 'success') {
      funded.value = true
    }
  } catch(error) {
    console.error(error)
  }
  finishingMulti.value = false
  if (!funded.value) {
    userErrorMessage.value = 'Unable to finish multifund card.'
  }
}
</script>
