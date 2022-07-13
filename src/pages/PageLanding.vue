<template>
  <div
    class="my-10 mx-auto px-4 max-w-md"
  >
    <div v-if="!spent">
      <HeadlineDefault level="h1">
        <span class="block mb-8 text-5xl font-semibold">
          Hey!
        </span>
        <span v-if="amount != null">
          You are just about to receive
          <span
            :title="amountInEur?.toLocaleString(undefined, { style: 'currency', currency: 'EUR', maximumFractionDigits: 4 })"
          >
            {{ (amount / (100 * 1000 * 1000)).toLocaleString(undefined, { maximumFractionDigits: 8, minimumFractionDigits: 8 }) }}
          </span>
          bitcoin*
        </span>
      </HeadlineDefault>
      <ParagraphDefault v-if="amount != null" class="text-sm mt-3">
        *&nbsp;via Lightning
      </ParagraphDefault>
    </div>
    <div v-if="amount == null">
      <h1 class="text-4xl font-semibold mb-8">
        It seems that this QR code has already been used.
      </h1>
      <ParagraphDefault>
        But don't worry: You can get your own bitcoin at a Bitcoin ATM or a Crypto exchange etc.
      </ParagraphDefault>
    </div>
    <div v-if="spent && amount != null">
      <h1 class="text-4xl font-semibold mb-8">
        Your QR code has just been used. 🥳
      </h1>
      <ParagraphDefault>
        You can get more bitcoin at a Bitcoin ATM or a Crypto exchange etc.
      </ParagraphDefault>
    </div>
    <div v-if="userErrorMessage != null">
      <ParagraphDefault
        class="text-red-500"
      >
        {{ userErrorMessage }}
      </ParagraphDefault>
    </div>
    <div class="my-10">
      <svg
        class="float-right w-16 ml-3 mb-3"
        xmlns="http://www.w3.org/2000/svg"
        xml:space="preserve"
        shape-rendering="geometricPrecision"
        text-rendering="geometricPrecision"
        image-rendering="optimizeQuality"
        fill-rule="evenodd"
        clip-rule="evenodd"
        viewBox="0 0 4091.27 4091.73"
      >
        <g fill-rule="nonzero">
          <path fill="#F7931A" d="M4030.06 2540.77C3756.82 3636.78 2646.74 4303.79 1550.6 4030.48 454.92 3757.24-212.09 2647.09 61.27 1551.17c273.12-1096.13 1383.2-1763.19 2479-1489.95C3636.33 334.46 4303.3 1444.73 4030.03 2540.79l.02-.02z" />
          <path fill="#fff" d="M2947.77 1754.38c40.72-272.26-166.56-418.61-450-516.24l91.95-368.8-224.5-55.94-89.51 359.09c-59.02-14.72-119.63-28.59-179.87-42.34L2186 768.69l-224.36-55.94-92 368.68c-48.84-11.12-96.81-22.11-143.35-33.69l.26-1.16-309.59-77.31-59.72 239.78s166.56 38.18 163.05 40.53c90.91 22.69 107.35 82.87 104.62 130.57l-104.74 420.15c6.26 1.59 14.38 3.89 23.34 7.49-7.49-1.86-15.46-3.89-23.73-5.87l-146.81 588.57c-11.11 27.62-39.31 69.07-102.87 53.33 2.25 3.26-163.17-40.72-163.17-40.72l-111.46 256.98 292.15 72.83c54.35 13.63 107.61 27.89 160.06 41.3l-92.9 373.03 224.24 55.94 92-369.07c61.26 16.63 120.71 31.97 178.91 46.43l-91.69 367.33 224.51 55.94 92.89-372.33c382.82 72.45 670.67 43.24 791.83-303.02 97.63-278.78-4.86-439.58-206.26-544.44 146.69-33.83 257.18-130.31 286.64-329.61l-.07-.05zm-512.93 719.26c-69.38 278.78-538.76 128.08-690.94 90.29l123.28-494.2c152.17 37.99 640.17 113.17 567.67 403.91zm69.43-723.3c-63.29 253.58-453.96 124.75-580.69 93.16l111.77-448.21c126.73 31.59 534.85 90.55 468.94 355.05h-.02z" />
        </g>
      </svg>
      
      <ParagraphDefault>
        Bitcoin is a <strong>digital currency</strong>.
      </ParagraphDefault>
      <ParagraphDefault>
        It is being managed by all members of the bitcoin network, which means it is <strong>not under control</strong> of any central bank, government, or company.
      </ParagraphDefault>
      <ParagraphDefault>
        Transactions (including international ones) are as easy as scanning a QR code. Just give it a try!
      </ParagraphDefault>
    </div>
    <div class="my-10">
      <HeadlineDefault level="h2">
        <span v-if="amount != null">1. </span>Download a wallet
      </HeadlineDefault>
      <ParagraphDefault>
        To receive, store and spend your bitcoin, you need a <strong>Lightning wallet</strong>.
        For every-day use and small amounts, a smartphone app is most convenient.
      </ParagraphDefault>
      <ParagraphDefault>
        We recommend
        <LinkDefault href="https://www.walletofsatoshi.com/">Wallet of Satoshi</LinkDefault>.
        <LinkDefault
          href="https://www.walletofsatoshi.com/"
          class="block w-40 my-5"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 313.1 76.32">
            <path fill="#fad228" d="M110.47 44.8H121c.84 0 1.22-.64.9-1.48l-17.6-42A2 2 0 0 0 102.22 0H87.63a2 2 0 0 0-2 1.34L66 48.11c-.32.84.06 1.48.83 1.48h13.7a1.42 1.42 0 0 1 1.32 1.93l-9.7 24.8 30.55-32.63A1 1 0 0 0 102 42H84.73a1.42 1.42 0 0 1-1.32-2l5.06-12.91 6.86-17.47 6.78 17.51h-7.54a1.42 1.42 0 0 0-1.32.9l-2.83 7.22a1.42 1.42 0 0 0 1.32 1.93H105a1.42 1.42 0 0 1 1.33.91l2.08 5.36a1.92 1.92 0 0 0 2.06 1.35Zm62.65 0h37.42a1.3 1.3 0 0 0 1.46-1.41V35.9a1.3 1.3 0 0 0-1.47-1.41h-26V1.41A1.35 1.35 0 0 0 183 0h-9.92a1.3 1.3 0 0 0-1.47 1.41v42a1.3 1.3 0 0 0 1.51 1.39Zm45.36 0h42a1.3 1.3 0 0 0 1.52-1.41V35.9a1.31 1.31 0 0 0-1.47-1.41h-30.59v-7.36h25.59a1.33 1.33 0 0 0 1.48-1.4v-7a1.33 1.33 0 0 0-1.48-1.41h-25.59v-7h30.59A1.3 1.3 0 0 0 262 8.89V1.41A1.3 1.3 0 0 0 260.53 0h-42A1.3 1.3 0 0 0 217 1.41v42a1.3 1.3 0 0 0 1.48 1.39ZM71.79 0H61.61a1.71 1.71 0 0 0-1.85 1.41L52.08 34.3 44.91 1.41A1.65 1.65 0 0 0 43.12 0H30.38a1.71 1.71 0 0 0-1.85 1.41L21.36 34.3 13.68 1.41A1.65 1.65 0 0 0 11.89 0H1.14C.24 0-.14.51.05 1.41l10.88 42a1.68 1.68 0 0 0 1.79 1.41H28.4a1.65 1.65 0 0 0 1.79-1.41l6.27-28.31 6.34 28.29a1.65 1.65 0 0 0 1.79 1.41H60.2a1.66 1.66 0 0 0 1.8-1.41l10.87-42C73.07.51 72.68 0 71.79 0Zm239.84 0h-43.52a1.3 1.3 0 0 0-1.47 1.41v7.48a1.3 1.3 0 0 0 1.47 1.41h15.29v33.09a1.3 1.3 0 0 0 1.48 1.41h10a1.33 1.33 0 0 0 1.47-1.41V10.3h15.3a1.3 1.3 0 0 0 1.47-1.41V1.41A1.3 1.3 0 0 0 311.63 0ZM127.76 44.8h37.42a1.3 1.3 0 0 0 1.47-1.41V35.9a1.3 1.3 0 0 0-1.47-1.41h-26V1.41a1.35 1.35 0 0 0-1.5-1.41h-9.92a1.3 1.3 0 0 0-1.47 1.41v42a1.3 1.3 0 0 0 1.47 1.39Zm-3.84 9.6h-11.53c-3.13 0-4.53 1.31-4.53 4.36v10.37c0 3.05 1.4 4.36 4.53 4.36h11.53c3.16 0 4.51-1.31 4.51-4.36V58.76c0-3.05-1.35-4.36-4.51-4.36Zm-1 12.95c0 1.48-.29 1.75-2.07 1.75h-5.51c-1.76 0-2.08-.27-2.08-1.75v-6.81c0-1.47.32-1.75 2.08-1.75h5.51c1.78 0 2.07.28 2.07 1.75Zm51.87-5.59h-8.75c-.89 0-1.16-.27-1.16-.95v-1.06c0-.68.27-1 1.16-1h6.7c.65 0 .89.28.89.85v.16a.55.55 0 0 0 .62.6h4a.55.55 0 0 0 .62-.6v-1.08c0-3.21-1.11-4.28-4.4-4.28H164c-3.19 0-4.51 1.31-4.51 4.36v2.84c0 3.06 1.32 4.36 4.51 4.36h8.74c.9 0 1.17.28 1.17 1v1.23c0 .68-.27.95-1.17.95h-7.34c-.62 0-.86-.27-.86-.85v-.16a.56.56 0 0 0-.62-.6h-4a.55.55 0 0 0-.62.6v1.12c0 3.22 1.08 4.28 4.4 4.28h11.2c3.19 0 4.51-1.31 4.51-4.36v-3c-.06-3.1-1.41-4.41-4.57-4.41Zm85.43 0h-8.75c-.89 0-1.16-.27-1.16-.95v-1.06c0-.68.27-1 1.16-1h6.7c.64 0 .89.28.89.85v.16a.55.55 0 0 0 .62.6h4a.55.55 0 0 0 .62-.6v-1.08c0-3.21-1.11-4.28-4.4-4.28h-10.48c-3.19 0-4.51 1.31-4.51 4.36v2.84c0 3.06 1.32 4.36 4.51 4.36h8.74c.89 0 1.16.28 1.16 1v1.23c0 .68-.27.95-1.16.95h-7.34c-.62 0-.86-.27-.86-.85v-.16a.57.57 0 0 0-.62-.6h-4.05a.55.55 0 0 0-.62.6v1.12c0 3.22 1.08 4.28 4.4 4.28h11.2c3.18 0 4.51-1.31 4.51-4.36v-3c0-3.1-1.33-4.41-4.51-4.41Zm26.65-7.36h-4.21a.56.56 0 0 0-.63.6v6.66h-9.2V55a.57.57 0 0 0-.65-.6H268a.55.55 0 0 0-.62.6v17.89a.55.55 0 0 0 .62.6h4.18a.57.57 0 0 0 .65-.6v-6.84h9.2v6.84a.56.56 0 0 0 .63.6h4.21a.55.55 0 0 0 .62-.6V55a.55.55 0 0 0-.57-.6Zm-137.62 0h-17.07a.55.55 0 0 0-.62.6v17.89a.55.55 0 0 0 .62.6h4.19a.58.58 0 0 0 .65-.6v-6.52h10.15a.57.57 0 0 0 .64-.6v-3.19a.57.57 0 0 0-.64-.6H137v-3.19h12.3a.55.55 0 0 0 .62-.6V55a.55.55 0 0 0-.62-.6Zm146.47 0h-4.18a.55.55 0 0 0-.62.6v17.89a.55.55 0 0 0 .62.6h4.18a.57.57 0 0 0 .65-.6V55a.57.57 0 0 0-.6-.6Zm-100.28.6a.83.83 0 0 0-.86-.57h-6.16a.83.83 0 0 0-.89.57l-7.42 17.89c-.14.36 0 .63.38.63h4.45a.8.8 0 0 0 .86-.57l1-2.68h9.1l1 2.68a.8.8 0 0 0 .87.57h4.69c.33 0 .49-.27.35-.63Zm-7 11 2.89-7.52 2.92 7.52Zm30.9-11.6H201a.55.55 0 0 0-.62.6v3.19a.55.55 0 0 0 .62.6h6.45v14.1a.55.55 0 0 0 .62.6h4.21a.56.56 0 0 0 .62-.6v-14.1h6.46a.55.55 0 0 0 .62-.6V55a.55.55 0 0 0-.64-.6Zm18.46 0h-11.52c-3.13 0-4.54 1.31-4.54 4.36v10.37c0 3.05 1.41 4.36 4.54 4.36h11.52c3.16 0 4.51-1.31 4.51-4.36V58.76c0-3.05-1.31-4.36-4.51-4.36Zm-.94 12.95c0 1.48-.3 1.75-2.08 1.75h-5.51c-1.75 0-2.07-.27-2.07-1.75v-6.81c0-1.47.32-1.75 2.07-1.75h5.51c1.78 0 2.08.28 2.08 1.75Z" />
          </svg>
        </LinkDefault>
      </ParagraphDefault>
      
      <ParagraphDefault>
        You can also try
        <LinkDefault href="https://bluewallet.io/">BlueWallet</LinkDefault>,
        <LinkDefault href="https://muun.com/">Muun</LinkDefault>,
        <LinkDefault href="https://phoenix.acinq.co/">Phoenix</LinkDefault>,
        or any other Lightning wallet*.
        <br>
        <small>*&nbsp;that understands LNURL</small>
      </ParagraphDefault>
    </div>
    <div v-if="amount != null">
      <HeadlineDefault level="h2">
        2. Receive your bitcoin
      </HeadlineDefault>
      <ParagraphDefault v-if="!spent">
        As soon as your wallet is installed, scan the QR code on your tip card again or click / scan the QR code below.
      </ParagraphDefault>
      <ParagraphDefault v-else>
        <strong>Congrats!</strong> The bitcoin were just transferred to your wallet. 🎉
      </ParagraphDefault>
      <div class="relative w-full max-w-xs p-10 mx-auto">
        <!-- eslint-disable vue/no-v-html -->
        <a
          class="block transition-opacity"
          :class="{ 'opacity-20 blur-sm pointer-events-none': spent }"
          :href="!spent ? `lightning:${lnurl}`: undefined"
          v-html="qrCodeSvg"
        />
        <!-- eslint-enable vue/no-v-html -->
        <div v-if="spent" class="absolute top-10 left-10 right-10 bottom-10 grid place-items-center">
          <AnimatedCheckmark class="w-5/12" />
        </div>
      </div>
    </div>
    <div>
      <HeadlineDefault level="h2">
        <span v-if="amount != null">3. </span>Use your bitcoin
      </HeadlineDefault>
      <ParagraphDefault>
        You can now
        spend your bitcoin at a store or on a website that accepts bitcoin,
        transfer them to your friend's or colleague's Lightning wallet,
        or just hodl them.
      </ParagraphDefault>
      <ParagraphDefault>
        Here are a few websites where you can pay with bitcoin via Lightning:<br>
        <LinkDefault href="https://lightning-roulette.com/" /><br>
        <LinkDefault href="https://lightninggem.com/" /><br>
        <LinkDefault href="https://kriptode.com/" />
      </ParagraphDefault>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'
import { decodelnurl, type LNURLWithdrawParams } from 'js-lnurl'
import QRCode from 'qrcode-svg'

import { LNURL_ORIGIN } from '@/modules/constants'
import LinkDefault from '@/components/typography/LinkDefault.vue'
import ParagraphDefault from '@/components/typography/ParagraphDefault.vue'
import HeadlineDefault from '@/components/typography/HeadlineDefault.vue'
import AnimatedCheckmark from '../components/AnimatedCheckmark.vue'

const spent = ref<boolean | undefined>(undefined)
const amount = ref<number | undefined>(undefined)
const message = ref<string | undefined>(undefined)
const qrCodeSvg = ref<string | undefined>(undefined)
const userErrorMessage = ref<string | undefined>(undefined)
const btcEurRate = ref<number | undefined>(undefined)

const amountInEur = computed(() => {
  if (amount.value == null || btcEurRate.value == null) {
    return undefined
  }
  return amount.value / btcEurRate.value
})

const route = useRoute()
const lnurl = String(route.query.lightning)

const loadBtcEurRate = async () => {
  const krakenResponse = await axios.get('https://api.kraken.com/0/public/Ticker?pair=BTCEUR')
  btcEurRate.value = Math.floor((100 * 1000 * 1000) / parseFloat(krakenResponse.data.result.XXBTZEUR.c[0]))
}

const loadLnurlData = async () => {

  let lnurlUrl: URL | undefined
  try {
    lnurlUrl = new URL(decodelnurl(lnurl))
  } catch (error) {
    userErrorMessage.value = 'Sorry, the provided LNURL is invalid.'
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
  } catch (error) {
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

  setTimeout(loadLnurlData, 10 * 1000)
}

onMounted(() => {
  loadBtcEurRate()
  loadLnurlData()
})

</script>
