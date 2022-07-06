<template>
  <div>
    <p v-if="spent != null">
      Already spent? <strong>{{ spent === true ? 'yes' : 'no' }}</strong>
    </p>
    <p v-if="message != null && message != ''">
      Message: <strong>{{ message }}</strong>
    </p>
    <p v-if="amount != null">
      Amount: <strong>{{ amount }} sats</strong>
      <span v-if="amountInEur != null">
        ({{ amountInEur.toLocaleString(undefined, { style: 'currency', currency: 'EUR', maximumFractionDigits: 4 }) }})
      </span>
    </p>
    <div>
      <!-- eslint-disable vue/no-v-html -->
      <a
        v-if="qrCodeSvg != null"
        class="inline-block"
        :href="`lightning:${lnurl}`"
        v-html="qrCodeSvg"
      />
      <!-- eslint-enable vue/no-v-html -->
    </div>
    <p
      v-if="userErrorMessage != null"
      class="text-red-500"
    >{{ userErrorMessage }}</p>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import axios, { type AxiosError } from 'axios'
import { decodelnurl, type LNURLWithdrawParams } from 'js-lnurl'
import QRCode from 'qrcode-svg'

import { LNURL_ORIGIN } from '@/modules/constants'

const spent = ref<boolean | undefined>(undefined)
const amount = ref<number | undefined>(undefined)
const amountInEur = ref<number | undefined>(undefined)
const message = ref<string | undefined>(undefined)
const qrCodeSvg = ref<string | undefined>(undefined)
const userErrorMessage = ref<string | undefined>(undefined)

const route = useRoute()
const lnurl = String(route.query.lightning)

onMounted(async () => {
  
  let lnurlUrl: URL | undefined
  try {
    lnurlUrl = new URL(decodelnurl(lnurl))
  } catch (error) {
    userErrorMessage.value = 'Invalid LNURL.'
    console.error(error)
    return
  }

  if (lnurlUrl.origin !== LNURL_ORIGIN) {
    userErrorMessage.value = 'LNURL points to a different server.'
    console.error(`LNURL points to a foreign origin: ${lnurlUrl.origin}`)
    return
  }

  let lnurlContent: LNURLWithdrawParams
  try {
    const response = await axios.get(lnurlUrl.href)
    lnurlContent = response.data
  } catch (error: unknown | AxiosError) {
    if (
      axios.isAxiosError(error)
      && error.response?.status === 404
      && ['Withdraw is spent.', 'LNURL-withdraw not found.']
        .includes((error.response?.data as { detail: string }).detail)
    ) {
      spent.value = true
      return
    }
    userErrorMessage.value = 'Server cannot find LNURL.'
    console.error(error)
    return
  }
  
  if (lnurlContent.tag !== 'withdrawRequest') {
    userErrorMessage.value = 'This website does not support the provided type of LNURL.'
    return
  }

  amount.value = lnurlContent.maxWithdrawable / 1000

  qrCodeSvg.value = new QRCode(lnurl).svg()

  message.value = lnurlContent.defaultDescription

  const krakenResponse = await axios.get('https://api.kraken.com/0/public/Ticker?pair=BTCEUR')

  amountInEur.value = amount.value / Math.floor((100 * 1000 * 1000) / parseFloat(krakenResponse.data.result.XXBTZEUR.c[0]))

})

</script>
