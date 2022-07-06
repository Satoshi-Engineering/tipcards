<template>
  <div
    class="my-10 mx-auto px-4 max-w-md"
  >
    <div
      v-if="amount != null"
    >
      <h1 class="text-4xl font-semibold">
        <span class="block mb-8 text-5xl font-semibold">
          Hey!
        </span>
        You are just about to receive
        <span
          :title="amountInEur?.toLocaleString(undefined, { style: 'currency', currency: 'EUR', maximumFractionDigits: 4 })"
        >
          {{ (amount / (100 * 1000 * 1000)).toLocaleString(undefined, { maximumFractionDigits: 8, minimumFractionDigits: 8 }) }}
        </span>
        bitcoin *
      </h1>
      <p class="text-sm mt-3">* via Lightning</p>
    </div>
    <div class="my-10">
      <p>
        Bitcoin is a <strong>digital currency</strong>.
      </p>
      <p>
        It is being managed by all members of the bitcoin network, which means it is <strong>not under control</strong> of any central bank, government, or company.
      </p>
    </div>
    <div class="my-10">
      <h2 class="text-2xl font-bold">Download a wallet</h2>
      <p>
        We recommend <a href="https://www.walletofsatoshi.com/" target="_blank">Wallet of Satoshi</a>
      </p>
      <p>
        As soon as your wallet is installed, scan the QR code on your tip card again or click / scan the QR code below.
      </p>
    </div>
    <div
      v-if="qrCodeSvg != null"
      class="text-center w-full max-w-md"
    >
      <!-- eslint-disable vue/no-v-html -->
      <a
        class="inline-block w-full max-w-xs p-10"
        :href="`lightning:${lnurl}`"
        v-html="qrCodeSvg"
      />
      <!-- eslint-enable vue/no-v-html -->
    </div>

    <p
      v-if="userErrorMessage != null"
      class="text-red-500"
    >
      {{ userErrorMessage }}
    </p>
    





    <div class="mt-20">
      <p v-if="spent != null">
        Already spent? <strong>{{ spent === true ? 'yes' : 'no' }}</strong>
      </p>
      <p v-if="message != null && message != ''">
        Message: <strong>{{ message }}</strong>
      </p>
    </div>
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

  qrCodeSvg.value = new QRCode({
    content: lnurl,
    container: 'svg-viewbox',
    join: true,
    padding: 0,
  }).svg()

  message.value = lnurlContent.defaultDescription

  const krakenResponse = await axios.get('https://api.kraken.com/0/public/Ticker?pair=BTCEUR')

  amountInEur.value = amount.value / Math.floor((100 * 1000 * 1000) / parseFloat(krakenResponse.data.result.XXBTZEUR.c[0]))

})

</script>
