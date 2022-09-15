<template>
  <div class="my-10 mx-auto w-full max-w-md px-4">
    <div
      v-if="backlink != null"
      class="px-4"
    >
      <LinkDefault
        :href="backlink"
        @click.prevent="$router.back()"
      >
        <i class="bi bi-caret-left-fill" />{{ t('general.back') }}
      </LinkDefault>
    </div>
    <HeadlineDefault level="h1">
      {{ t('funding.headline') }}
    </HeadlineDefault>
    <ParagraphDefault
      v-if="invoice == null"
      class="mb-8"
    >
      {{ t('funding.text') }}
    </ParagraphDefault>
    <div
      v-if="invoice != null"
    >
      <ParagraphDefault>
        <Translation keypath="funding.invoiceText">
          <template #amount>
            <strong>{{ invoiceAmount }}</strong>
          </template>
        </Translation>
      </ParagraphDefault>
      <LightningQrCode
        :value="invoice"
      />
    </div>
    <div
      v-else
    >
      <form @submit.prevent="fund">
        <label class="block mb-2">
          <SatsAmountSelector
            :amount-sats="amount"
            :rate-btc-eur="rateBtcEur"
            @update="amount = $event"
          />
        </label>
        <label class="block mb-2">
          <input
            v-model="text"
            type="text"
            class="w-full border my-1 px-3 py-2 focus:outline-none"
          >
          <small class="block">({{ t('funding.form.textHint') }})</small>
        </label>
        <div class="text-center mt-4">
          <ButtonDefault
            type="submit"
          >
            {{ t('funding.form.button') }}
          </ButtonDefault>
        </div>
      </form>
    </div>
    <div v-if="userErrorMessage != null">
      <ParagraphDefault
        class="text-red-500"
      >
        {{ userErrorMessage }}
      </ParagraphDefault>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeMount, onMounted, ref } from 'vue'
import axios from 'axios'
import { useI18n, Translation } from 'vue-i18n'
import { useRoute } from 'vue-router'

import ButtonDefault from '@/components/ButtonDefault.vue'
import { BACKEND_API_ORIGIN } from '@/constants'
import LightningQrCode from '@/components/LightningQrCode.vue'
import HeadlineDefault from '@/components/typography/HeadlineDefault.vue'
import ParagraphDefault from '@/components/typography/ParagraphDefault.vue'
import SatsAmountSelector from '@/components/SatsAmountSelector.vue'
import LinkDefault from '@/components/typography/LinkDefault.vue'

const { t } = useI18n()

const route = useRoute()

const amount = ref(1000)
const text = ref('Have fun with Bitcoin :)')
const userErrorMessage = ref<string>()
const invoice = ref<string>()
const invoiceAmount = ref<number>()
const rateBtcEur = ref<number | undefined>(undefined)

const backlink = computed(() => {
  try {
    return new URL(document.referrer).origin === location.origin ? document.referrer : null
  } catch (error) {
    return null
  }
})

const loadRateBtcEur = async () => {
  const krakenResponse = await axios.get('https://api.kraken.com/0/public/Ticker?pair=BTCEUR')
  rateBtcEur.value = parseFloat(krakenResponse.data.result.XXBTZEUR.c[0])
}

const checkCardForInvoice = async () => {
  try {
    await axios.get(`${BACKEND_API_ORIGIN}/api/lnurl/${route.params.cardHash}`)
  } catch (error) {
    if (!axios.isAxiosError(error)) {
      return
    }
    const responseData = error.response?.data as { code: string, data?: { invoicePaymentRequest: string, amount: number } }
    if (
      responseData.code === 'CardNotFunded'
      && typeof responseData.data?.invoicePaymentRequest === 'string'
      && typeof responseData.data?.amount === 'number'
    ) {
      invoice.value = responseData.data?.invoicePaymentRequest
      invoiceAmount.value = responseData.data?.amount
    }
  }
}

onBeforeMount(loadRateBtcEur)
onMounted(checkCardForInvoice)

const fund = async () => {
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
    console.error(error)
  }
  
  if (invoice.value == null) {
    userErrorMessage.value = 'Error when creating funding invoice.'
    return
  }
}
</script>
