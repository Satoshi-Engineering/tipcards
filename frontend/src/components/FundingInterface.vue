<template>
  <div>
    <HeadlineDefault level="h2">
      {{ t('Fund your tip card') }}
    </HeadlineDefault>
    <div
      v-if="invoice != null"
    >
      <LightningQrCode
        :value="invoice"
      />
    </div>
    <div
      v-else
    >
      <form @submit.prevent="fund">
        <SatsAmountSelector
          :amount-sats="amount"
          :rate-btc-eur="rateBtcEur"
          @update="amount = $event"
        />
        <div class="text-center mt-4">
          <ButtonDefault
            type="submit"
          >
            Fund now
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
import { onMounted, ref } from 'vue'
import axios from 'axios'
import { useI18n } from 'vue-i18n'

import ButtonDefault from '@/components/ButtonDefault.vue'
import { BACKEND_API_ORIGIN } from '@/constants'
import LightningQrCode from '@/components/LightningQrCode.vue'
import HeadlineDefault from '@/components/typography/HeadlineDefault.vue'
import ParagraphDefault from '@/components/typography/ParagraphDefault.vue'
import SatsAmountSelector from '@/components/SatsAmountSelector.vue'

const { t } = useI18n()

const amount = ref(1000)
const text = ref('Have fun with Bitcoin :)')
const userErrorMessage = ref<string>()
const invoice = ref<string>()

const props = defineProps({
  cardHash: {
    type: String,
    required: true,
  },
  rateBtcEur: {
    type: Number,
    default: undefined,
  },
})

const checkCardForInvoice = async () => {
  try {
    await axios.get(`${BACKEND_API_ORIGIN}/api/lnurl/${props.cardHash}`)
  } catch (error) {
    if (!axios.isAxiosError(error)) {
      return
    }
    const responseData = error.response?.data as { code: string, data?: { invoicePaymentRequest: string } }
    if (responseData.code === 'CardNotFunded' && typeof responseData.data?.invoicePaymentRequest === 'string') {
      invoice.value = responseData.data?.invoicePaymentRequest
    }
  }
}

onMounted(checkCardForInvoice)

const fund = async () => {
  try {
    const response = await axios.post(
      `${BACKEND_API_ORIGIN}/api/invoice/create/${props.cardHash}`,
      {
        amount: amount.value,
        text: text.value,
      },
    )
    if (response.data.status === 'success' && typeof response.data.data === 'string') {
      invoice.value = response.data.data
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
