<template>
  <div class="mx-auto w-full max-w-md">
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
    <div class="mt-8 px-4">
      <HeadlineDefault
        level="h1"
        class="mt-10"
      >
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
          :success="funded"
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
              :min="500"
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
            <ButtonDefault type="submit">
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

  if (card?.invoice.amount != null) {
    invoiceAmount.value = card.invoice.amount
  }
  if (card?.invoice.payment_request != null) {
    invoice.value = card.invoice.payment_request
  }
  if (status === 'funded' && invoice.value != null) {
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
