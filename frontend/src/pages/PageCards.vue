<template>
  <div
    v-if="setId == null || userErrorMessage != null"
    class="min-h-screen grid place-items-center text-center"
  >
    <div>
      <div class="mb-6">
        <ButtonDefault
          @click="createNewCards"
        >
          {{ t('cards.buttonCreateNewCards') }}
        </ButtonDefault>
      </div>

      <p
        v-if="userErrorMessage != null"
        class="text-red-500 text-align-center"
      >
        {{ userErrorMessage }}
      </p>
    </div>
  </div>
  <div v-else class="mb-1 border-b print:hidden">
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
          Number of cards:
        </span>
        <input
          v-model="settings.numberOfCards"
          type="number"
          class="w-full border my-1 px-3 py-2 focus:outline-none"
        >
      </label>
      <label class="block mb-2">
        <span class="block">
          Card headline:
        </span>
        <input
          v-model="settings.cardHeadline"
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
          v-model="settings.cardCopytext"
          class="w-full border my-1 px-3 py-2 focus:outline-none"
        />
      </label>
      <div class="mb-2">
        Add logo on top of QR codes:
      </div>
      <label class="block">
        <input
          v-model="settings.cardsQrCodeLogo"
          value="bitcoin"
          type="radio"
        >
        Bitcoin
      </label>
      <label class="block">
        <input
          v-model="settings.cardsQrCodeLogo"
          value="lightning"
          type="radio"
        >
        Lightning
      </label>
      <label class="block">
        <input
          v-model="settings.cardsQrCodeLogo"
          value=""
          type="radio"
        >
        No logo
      </label>
    </div>
    <div class="p-2 mb-1">
      Download all QR codes in a ZIP:
      <ButtonDefault
        @click="downloadZip(false)"
      >
        SVG
      </ButtonDefault><!--
      -->&nbsp;<!--
      --><ButtonDefault
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
                v-if="settings.cardsQrCodeLogo === 'bitcoin'"
                :width="0.26 * 256"
                :height="0.26 * 256"
                :x="0.37 * 256"
                :y="0.37 * 256"
              />
              <IconLightning
                v-if="settings.cardsQrCodeLogo === 'lightning'"
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
              v-if="settings.cardHeadline !== ''"
              level="h1"
              styling="h4"
              class="mb-1"
            >
              {{ settings.cardHeadline }}
            </HeadlineDefault>
            <!-- eslint-disable vue/no-v-html vue/no-v-text-v-html-on-component -->
            <ParagraphDefault
              v-if="settings.cardCopytext !== ''"
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
import { onMounted, ref, reactive, watch, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
// import axios from 'axios'
// import { decodelnurl, type LNURLWithdrawParams } from 'js-lnurl'
import QRCode from 'qrcode-svg'
import sanitizeHtml from 'sanitize-html'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'
import { useI18n, Translation as I18nT } from 'vue-i18n'

// import { LNURL_ORIGIN } from '@/modules/constants'
import formatNumber from '@/modules/formatNumber'
import svgToPng from '@/modules/svgToPng'
import { encodeLnurl } from '@/modules/lnurlHelpers'
import ButtonDefault from '../components/ButtonDefault.vue'
import IconBitcoin from '../components/svgs/IconBitcoin.vue'
import IconLightning from '../components/svgs/IconLightning.vue'
import HeadlineDefault from '../components/typography/HeadlineDefault.vue'
import ParagraphDefault from '../components/typography/ParagraphDefault.vue'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()

const cards = ref<Record<string, string>[]>([])
const userErrorMessage = ref<string | undefined>(undefined)
const userWarnings = ref<string[]>([])
const lnurlDescriptionMessage = ref<string | undefined>(undefined)

type Settings = {
  numberOfCards: number
  cardHeadline: string
  cardCopytext: string
  cardsQrCodeLogo: string
}

const initialSettings: Settings = {
  numberOfCards: 10,
  cardHeadline: 'Hey :)',
  cardCopytext: 'Scan this QR code and learn how to receive\n$$ bitcoin.',
  cardsQrCodeLogo: 'bitcoin',
}
const initialSettingsBase64 = btoa(encodeURIComponent(JSON.stringify(initialSettings)))
const settings = reactive<Settings>(initialSettings)
const resetSettings = (newSettings: Settings | undefined) => {
  settings.cardCopytext = newSettings && newSettings.cardCopytext || initialSettings.cardCopytext
  settings.cardHeadline = newSettings && newSettings.cardHeadline || initialSettings.cardHeadline
  settings.cardsQrCodeLogo = newSettings && newSettings.cardsQrCodeLogo || initialSettings.cardsQrCodeLogo
  settings.numberOfCards = newSettings && newSettings.numberOfCards || initialSettings.numberOfCards
}


const amount = ref<number | undefined>(undefined)
const cardsContainer = ref<HTMLElement | undefined>(undefined)

const cardCopytextComputed = computed(() => settings.cardCopytext
  .replace('$$', formatNumber((amount.value || 0) / (100 * 1000 * 1000), 8, 8))
  .replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1<br>$2'),
)

const setId = computed(() => route.params.setId == null || route.params.setId === '' ? undefined : String(route.params.setId))

const createNewCards = () => {
  router.push({ ...route, params: { ...route.params, setId: crypto.randomUUID() } })
}

const repopulateCards = async () => {
  cards.value = await Promise.all([...Array(settings.numberOfCards).keys()].map(async (_, index) => {
    const cardHash = await hashSha256(`${setId.value}/${index}`)
    const lnurlDecoded = `${location.protocol}//${location.host}/api/lnurl/${cardHash}`
    const lnurlEncoded = encodeLnurl(lnurlDecoded)
    const routeHref = router.resolve({ name: 'landing', query: { lightning: lnurlEncoded.toUpperCase() } }).href
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
  }))
  if (cards.value.length % 2 !== 0) {
    cards.value = [...cards.value, { url: '' }]
  }
}

const putSettingsIntoUrl = () => {
  if (setId.value == null) {
    return
  }
  const settingsBase64 = btoa(encodeURIComponent(JSON.stringify(settings)))
  let settingsForUrl: string = settingsBase64
  if (settingsBase64 === initialSettingsBase64) {
    settingsForUrl = ''
  }
  router.replace({
    ...route,
    params: {
      ...route.params,
      settings: settingsForUrl,
    },
  })
}

watch(settings, putSettingsIntoUrl)

const urlChanged = () => {
  if (route.params.settings == null && route.params.settings === '') {
    return
  }
  const settingsEncoded = String(route.params.settings)
  let settingsDecoded: Settings | undefined = undefined
  try {
    settingsDecoded = JSON.parse(decodeURIComponent(atob(settingsEncoded)))
  } catch (e) {
    // do nothing
  }
  resetSettings(settingsDecoded)
  repopulateCards()
}

onMounted(urlChanged)
  
watch(() => route.params, urlChanged)

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
      zip.file(`qrCode_${index}_${amount.value}sats_${setId.value}.${fileExtension}`, fileContent)
    }))
  const zipFileContent = await zip.generateAsync({ type: 'blob' })
  saveAs(zipFileContent, `qrCodes_${amount.value}sats_${setId.value}_${fileExtension}.zip`)
}

const hashSha256 = async (message: string) => {
  const msgUint8 = new TextEncoder().encode(message)                           // encode as (utf-8) Uint8Array
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8)           // hash the message
  const hashArray = Array.from(new Uint8Array(hashBuffer))                     // convert buffer to byte array
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('') // convert bytes to hex string
  return hashHex
}

</script>
