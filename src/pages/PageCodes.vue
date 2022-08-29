<template>
  <div
    v-if="withdrawId == null || userErrorMessage != null"
    class="min-h-screen grid place-items-center text-center"
  >
    <div>
      Enter your LNURLw withdraw ID<br>

      <div class="m-5 text-center">
        <form
          @submit="router.push({ ...route, params: { ...route.params, withdrawId: inputWithdrawId } })"
        >
          <input
            v-model="inputWithdrawId"
            type="text"
            class="w-full border my-1 px-3 py-2 focus:outline-none"
          >
          <ButtonDefault
            type="submit"
          >
            Create Codes
          </ButtonDefault>
        </form>
      </div>

      <small>(Needs to be from <LinkDefault :href="LNURL_ORIGIN" target="_blank">{{ LNURL_ORIGIN }}</LinkDefault>)</small>
      <p
        v-if="userErrorMessage != null"
        class="text-red-500 text-align-center"
      >
        {{ userErrorMessage }}
      </p>
    </div>
  </div>
  <div class="mb-1 border-b print:hidden">
    <div
      v-for="userWarning in userWarnings"
      :key="userWarning"
      class="bg-yellow-300 p-2 mb-1"
    >
      {{ userWarning }}
    </div>
    <div
      v-if="lnurlDescriptionMessage != null"
      class="p-2 mb-1"
    >
      Description that will be displayed in the wallet app:<br>
      <strong v-if="lnurlDescriptionMessage !== ''">{{ lnurlDescriptionMessage }}</strong>
      <span v-else>(empty)</span>
    </div>
    <div class="p-2 mb-1 max-w-md">
      <label class="block mb-2">
        <span class="block">
          Card headline:
        </span>
        <input
          v-model="cardHeadline"
          type="text"
          class="w-full border my-1 px-3 py-2 focus:outline-none"
        >
      </label>
      <label class="block mb-2">
        <span class="block">
          Card text:<br>
          <small>($$ will be replaced by the available amount of bitcoin)</small>
        </span>
        <textarea
          v-model="cardCopytext"
          class="w-full border my-1 px-3 py-2 focus:outline-none"
        />
      </label>
      <label class="block mb-2">
        <input
          v-model="showBtcLogo"
          type="checkbox"
        >
        Add Bitcoin logo on top of QR codes
      </label>
    </div>
    <div class="p-2 mb-1">
      Download all QR codes in a ZIP:
      <ButtonDefault
        @click="downloadZip(false)"
      >
        SVG
      </ButtonDefault>&nbsp;
      <ButtonDefault
        @click="downloadZip(true)"
      >
        PNG
      </ButtonDefault>
    </div>
  </div>
  <div
    v-if="cards.length > 0"
    ref="cardsContainer"
    class="relative w-[210mm] p-[15mm]"
  >
    <div
      v-for="card in cards"
      :key="card.url"
      class="relative break-inside-avoid w-[90mm] h-[55mm] float-left group"
    >
      <div class="group-odd:left-0 group-even:right-0 absolute border-l-[0.5px] opacity-50 h-3 -top-4" />
      <div class="group-odd:left-0 group-even:right-0 absolute border-l-[0.5px] opacity-50 h-3 -bottom-4" />
      <div class="hidden group-first:block right-0 absolute border-l-[0.5px] opacity-50 h-3 -top-4" />
      <div class="hidden group-last:block left-0 absolute border-l-[0.5px] opacity-50 h-3 -bottom-4" />

      <div class="group-odd:-left-4 group-even:-right-4 absolute border-t-[0.5px] opacity-50 w-3 top-0" />
      <div class="group-odd:-left-4 group-even:-right-4 absolute border-t-[0.5px] opacity-50 w-3 bottom-0" />      
      <div
        v-if="card.url != ''"
        class="absolute w-full h-full"
      >
        <a :href="card.url">
          <div class="absolute left-3 top-7 bottom-7 w-auto h-auto aspect-square">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="100%"
              height="100%"
              viewBox="0 0 256 256"
              class="qr-code-svg"
            >
              <!-- eslint-disable vue/no-v-html -->
              <g v-html="card.qrCodeSvg" />
              <!-- eslint-enable vue/no-v-html -->
              <IconBitcoin
                v-if="showBtcLogo"
                :width="0.26 * 256"
                :height="0.26 * 256"
                :x="0.37 * 256"
                :y="0.37 * 256"
              />
            </svg>
          </div>
        </a>
        <div class="absolute left-1/2 ml-2 mr-4 top-0 bottom-2 flex items-center">
          <div>
            <HeadlineDefault
              v-if="cardHeadline !== ''"
              level="h1"
              styling="h4"
              class="mb-1"
            >
              {{ cardHeadline }}
            </HeadlineDefault>
            <!-- eslint-disable vue/no-v-html vue/no-v-text-v-html-on-component -->
            <ParagraphDefault
              v-if="cardCopytext !== ''"
              class="text-sm leading-tight"
              v-html="sanitizeHtml(cardCopytextComputed)"
            />
            <!-- eslint-enable vue/no-v-html vue/no-v-text-v-html-on-component -->
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref, watch, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import QRCode from 'qrcode-svg'
import { decodelnurl, type LNURLWithdrawParams } from 'js-lnurl'
import sanitizeHtml from 'sanitize-html'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'

import { LNURL_ORIGIN } from '@/modules/constants'
import formatNumber from '@/modules/formatNumber'
import svgToPng from '@/modules/svgToPng'
import ButtonDefault from '../components/ButtonDefault.vue'
import LinkDefault from '../components/typography/LinkDefault.vue'
import IconBitcoin from '../components/svgs/IconBitcoin.vue'
import HeadlineDefault from '../components/typography/HeadlineDefault.vue'
import ParagraphDefault from '../components/typography/ParagraphDefault.vue'

const route = useRoute()
const router = useRouter()

const cards = ref<Record<string, string>[]>([])
const withdrawId = ref<string | undefined>(undefined)
const userErrorMessage = ref<string | undefined>(undefined)
const userWarnings = ref<string[]>([])
const lnurlDescriptionMessage = ref<string | undefined>(undefined)
const inputWithdrawId = ref<string>('')
const amount = ref<number | undefined>(undefined)
const cardHeadline = ref<string>('Hey :)')
const cardCopytext = ref<string>('Scan this QR code and learn how to receive\n$$ bitcoin.')
const showBtcLogo = ref<boolean>(true)
const cardsContainer = ref<HTMLElement | undefined>(undefined)

const cardCopytextComputed = computed(() => cardCopytext.value
  .replace('$$', formatNumber((amount.value || 0) / (100 * 1000 * 1000), 8, 8))
  .replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1<br>$2'),
)

const load = async () => {
  userErrorMessage.value = undefined

  withdrawId.value = route.params.withdrawId == null || route.params.withdrawId === '' ? undefined : String(route.params.withdrawId)
  if (withdrawId.value == null) {
    return
  }

  let lnurls: string[]
  try {
    const response = await axios.get(
      `${LNURL_ORIGIN}/withdraw/csv/${withdrawId.value}`,
      {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      },
    )
    lnurls = response.data.toLowerCase().match(/,*?((lnurl)([0-9]{1,}[a-z0-9]+){1})/g)
  } catch (error) {
    if (axios.isAxiosError(error)) {
      userErrorMessage.value = (error.response?.data as { detail: string }).detail
    }
    console.error(error)
    return
  }

  let lnurlContent: LNURLWithdrawParams
  try {
    const response = await axios.get(
      new URL(decodelnurl(lnurls[0])).href,
      {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      },
    )
    lnurlContent = response.data
  } catch (error) {
    if (
      axios.isAxiosError(error)
      && error.response?.status === 404
      && ['Withdraw is spent.', 'LNURL-withdraw not found.']
        .includes((error.response?.data as { detail: string }).detail)
    ) {
      userErrorMessage.value = `All LNURLs from withdraw "${withdrawId.value}" have been used.`
      return
    }
    userErrorMessage.value = 'Server cannot find LNURL.'
    console.error(error)
    return
  }

  if (lnurlContent.tag !== 'withdrawRequest') {
    userErrorMessage.value = 'Sorry, this website does not support the provided type of LNURL.'
    return
  }
  if (lnurlContent.minWithdrawable != lnurlContent.maxWithdrawable) {
    userWarnings.value = [...userWarnings.value, 'Warning: Minimum withdrawable amount differs from maximum withdrawable amount. Are you sure this is correct?']
  }
  if ((lnurlContent.minWithdrawable / 1000) < 1000) {
    userWarnings.value = [...userWarnings.value, 'Warning: Amount per LNURL is smaller than 1000 sats. Some wallet apps (like BlueWallet, Phoenix or Breez) might have problems with that. Please test your Tip cards before handing them out. :)']
  }
  lnurlDescriptionMessage.value = lnurlContent.defaultDescription
  amount.value = lnurlContent.minWithdrawable / 1000

  cards.value = lnurls.map(lnurl => {
    const routeHref = router.resolve({ name: 'landing', query: { lightning: lnurl.toUpperCase() } }).href
    const url = `${location.protocol}//${location.host}${routeHref}`
    return {
      url,
      qrCodeSvg: new QRCode({
          content: url,
          padding: 0,
          join: true,
          xmlDeclaration: false,
          container: 'none',
        }).svg(),
    }
  })

  if (cards.value.length % 2 !== 0) {
    cards.value = [...cards.value, { url: '' }]
  }
}

onMounted(load)
  
watch(() => route.params, load)

const downloadZip = async (asPng = false) => {
  const zip = new JSZip()
  if (cardsContainer.value == null) {
    return
  }
  const fileExtension = asPng ? 'png' : 'svg'
  await Promise.all(Array.from(cardsContainer.value.querySelectorAll('.qr-code-svg'))
    .map(async (svgEl, index) => {
      let fileContent: string | Blob = svgEl.outerHTML
      if (asPng) {
        fileContent = (await svgToPng({ width: 2000, height: 2000, svg: svgEl.outerHTML }) || 'error')
      }
      zip.file(`qrCode_${index}_${amount.value}sats_${withdrawId.value}.${fileExtension}`, fileContent)
    }))
  const zipFileContent = await zip.generateAsync({ type: 'blob' })
  saveAs(zipFileContent, `qrCodes_${amount.value}sats_${withdrawId.value}_${fileExtension}.zip`)
}


</script>
