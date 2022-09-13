<template>
  <div
    v-if="setId == null && userErrorMessage == null"
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
      <div 
        v-if="savedCardsSets.length > 0"
      >
        <HeadlineDefault level="h3">
          {{ t('cards.savedCardsSetsHeadline') }}
        </HeadlineDefault>
        <ul>
          <li
            v-for="cardsSet in savedCardsSets.reverse()"
            :key="cardsSet.setId"
            class="text-left"
          >
            <LinkDefault
              :bold="false"
              :to="{
                ...route,
                params: {
                  ...route.params,
                  setId: cardsSet.setId,
                  settings: cardsSet.settings,
                }
              }"
            >
              {{ cardsSet.setId }}
              <small class="block">({{ d(cardsSet.date, {
                year: 'numeric', month: 'numeric', day: 'numeric',
                hour: 'numeric', minute: 'numeric'
              }) }})</small>
            </LinkDefault>
          </li>
        </ul>
      </div>
    </div>
  </div>
  <div v-else class="mb-1 border-b print:hidden">
    <div class="p-2 pt-4">
      <LinkDefault
        :to="{ name: 'home' }"
      >
        <i class="bi bi-caret-left-fill" />{{ t('general.back') }}
      </LinkDefault>
    </div>
    <div
      v-for="userWarning in userWarnings"
      :key="userWarning"
      class="bg-yellow-300 p-2 mb-1"
    >
      {{ userWarning }}
    </div>
    <div class="p-2 mb-1 max-w-md">
      <div class="mb-2">
        <span class="block">
          Tip cards set ID:
        </span>
        <strong class="block">
          {{ setId }}
        </strong>
        <ButtonDefault
          @click="saveCardsSet"
        >
          {{ t('cards.buttonSaveCardsSet') }}
        </ButtonDefault>
      </div>
      <label class="block mb-2">
        <span class="block">
          Number of cards for this set:
        </span>
        <input
          v-model="settings.numberOfCards"
          type="number"
          inputmode="numeric"
          min="1"
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
          Card text:
        </span>
        <textarea
          v-model="settings.cardCopytext"
          class="w-full border my-1 px-3 py-2 focus:outline-none"
          rows="4"
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
      <small class="block">(QR code images only)</small>
      <div>
        <ButtonDefault
          @click="downloadZip(false)"
        >
          SVG
        </ButtonDefault>
        &nbsp;
        <ButtonDefault
          @click="downloadZip(true)"
        >
          PNG
        </ButtonDefault>
      </div>
    </div>
    <div
      v-if="cards.length > 0"
      class="p-2 max-w-md"
    >
      <label class="block mb-2">
        <span class="block">
          {{ t('cards.filterLabel') }}
        </span>
        <select
          v-model="cardsFilter"
          class="w-full border my-1 px-3 py-2"
        >
          <option value="">
            {{ t('cards.filter.all') }} ({{ cards.length }})
          </option>
          <option value="unfunded">
            {{ t('cards.filter.unfunded') }} ({{ cards.filter(card => card.status === 'unfunded').length }})
          </option>
          <option value="funded">
            {{ t('cards.filter.funded') }} ({{ cards.filter(card => card.status === 'funded').length }})
          </option>
          <option value="used">
            {{ t('cards.filter.used') }} ({{ cards.filter(card => card.status === 'used').length }})
          </option>
        </select>
      </label>
    </div>
    <div v-if="userErrorMessage != null" class="p-2">
      <p
        class="text-red-500 text-align-center"
      >
        {{ userErrorMessage }}
      </p>
    </div>
  </div>
  <div
    v-if="cards.length > 0"
  >
    <div
      class="w-full overflow-x-auto print:overflow-visible pb-4 print:pb-0"
    >
      <div
        ref="cardsContainer"
        class="relative w-[210mm] p-[15mm]"
      >
        <div
          v-for="card in cardsFilter === '' ? cards : cards.filter(card => card.status === cardsFilter)"
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
            :class="{ 'opacity-50': card.status === 'used' }"
          >
            <a :href="card.url">
              <div
                class="absolute left-3 top-7 bottom-7 w-auto h-auto aspect-square"
                :class="{ 'opacity-50 blur-sm': card.status === 'used' }"
              >
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
            <div
              class="absolute left-1/2 ml-2 mr-4 top-0 bottom-2 flex items-center"
              :class="{ 'opacity-50 blur-sm': card.status === 'used' }"
            >
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
            <div
              v-if="card.sats != null"
              class="absolute flex right-0.5 top-0.5 px-2 py-1 rounded-full bg-btcorange text-white text-xs break-anywhere"
            >
              <span class="m-auto">{{ card.sats }} sats</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref, reactive, watch, computed, onBeforeMount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import QRCode from 'qrcode-svg'
import sanitizeHtml from 'sanitize-html'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'
import { useI18n } from 'vue-i18n'

import { BACKEND_API_ORIGIN } from '@/constants'
import svgToPng from '@/modules/svgToPng'
import { encodeLnurl } from '@root/modules/lnurlHelpers'
import ButtonDefault from '../components/ButtonDefault.vue'
import IconBitcoin from '../components/svgs/IconBitcoin.vue'
import IconLightning from '../components/svgs/IconLightning.vue'
import HeadlineDefault from '../components/typography/HeadlineDefault.vue'
import ParagraphDefault from '../components/typography/ParagraphDefault.vue'
import LinkDefault from '../components/typography/LinkDefault.vue'
import loadCardStatus from '@/modules/loadCardStatus'

const route = useRoute()
const router = useRouter()
const { t, d } = useI18n()

type Card = {
  url: string,
  lnurl: string,
  status: string | null,
  sats: number | null,
  qrCodeSvg: string,
}
const cards = ref<Card[]>([])
const userErrorMessage = ref<string | undefined>(undefined)
const userWarnings = ref<string[]>([])

const cardsFilter = ref('')

const initialSettings = {
  numberOfCards: 10,
  cardHeadline: 'Hey :)',
  cardCopytext: 'You got a tip. 🎉\nScan this QR code and learn how to receive bitcoin.',
  cardsQrCodeLogo: 'bitcoin',
}
type Settings = typeof initialSettings
const initialSettingsBase64 = btoa(encodeURIComponent(JSON.stringify(initialSettings)))
const settings = reactive({ ...initialSettings })
const setSettings = (newSettings: Settings | undefined = undefined) => {
  const settingsKeys = Object.keys(initialSettings) as (keyof Settings)[]
  settingsKeys.forEach((key) => {
    if (newSettings == null || newSettings[key] == null) {
      (settings[key] as string | number) = initialSettings[key]
      return
    }
    (settings[key] as string | number) = newSettings[key]
  })
}

const cardsContainer = ref<HTMLElement | undefined>(undefined)

const cardCopytextComputed = computed(() => settings.cardCopytext
  .replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1<br>$2'),
)

const setId = computed(() => route.params.setId == null || route.params.setId === '' ? undefined : String(route.params.setId))

const createNewCards = () => {
  router.replace({ ...route, params: { ...route.params, setId: crypto.randomUUID(), settings: '' } })
}

onBeforeMount(() => {
  if (setId.value == null) {
    createNewCards()
  }
})

const repopulateCards = async () => {
  if (setId.value == null) {
    cards.value = []
    return
  }
  settings.numberOfCards = Math.max(Math.min(settings.numberOfCards, 500), 0)
  cards.value = await Promise.all([...Array(settings.numberOfCards).keys()].map(async (_, index) => {
    const cardHash = await hashSha256(`${setId.value}/${index}`)
    const lnurlDecoded = `${BACKEND_API_ORIGIN}/api/lnurl/${cardHash}`
    const lnurlEncoded = encodeLnurl(lnurlDecoded)
    const routeHref = router.resolve({ name: 'landing', query: { lightning: lnurlEncoded.toUpperCase() } }).href
    const url = `${location.protocol}//${location.host}${routeHref}`
    return {
      url,
      lnurl: lnurlEncoded,
      status: null,
      sats: null,
      qrCodeSvg: new QRCode({
          content: url,
          padding: 0,
          join: true,
          xmlDeclaration: false,
          container: 'none',
        }).svg(),
    }
  }))
  cards.value.forEach(async (card) => {
    const { status, message, sats } = await loadCardStatus(card.lnurl)
    if (status === 'ERROR') {
      userErrorMessage.value = message || 'Unknown error for LNURL.'
      return
    }
    card.status = status
    if (sats != null) {
      card.sats = sats
    }
  })
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

watch(settings, () => {
  putSettingsIntoUrl()
  repopulateCards()
})

const urlChanged = () => {
  const settingsEncoded = String(route.params.settings)
  let settingsDecoded: Settings | undefined = undefined
  try {
    settingsDecoded = JSON.parse(decodeURIComponent(atob(settingsEncoded)))
  } catch (e) {
    // do nothing
  }
  setSettings(settingsDecoded)
  repopulateCards()
  loadSavedCardsSets()
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
      zip.file(`qrCode_${index}_${setId.value}.${fileExtension}`, fileContent)
    }))
  const zipFileContent = await zip.generateAsync({ type: 'blob' })
  saveAs(zipFileContent, `qrCodes_${setId.value}_${fileExtension}.zip`)
}

type CardsSetRecord = {
  setId: string,
  settings: string,
  date: string,
}
const SAVED_CARD_SETS_KEY = 'savedTipCardsSets'
const savedCardsSets = ref<CardsSetRecord[]>([])
const loadSavedCardsSets = () => {
  try {
    savedCardsSets.value = JSON.parse(localStorage.getItem(SAVED_CARD_SETS_KEY) || '[]')
  } catch(error) {
    savedCardsSets.value = []
  }
}
const saveCardsSet = () => {
  if (setId.value == null) {
    return
  }
  loadSavedCardsSets()
  localStorage.setItem(SAVED_CARD_SETS_KEY, JSON.stringify([
    ...savedCardsSets.value.filter((set) => set.setId !== setId.value),
    {
      setId: setId.value,
      settings: route.params.settings,
      date: new Date().toISOString(),
    },
  ]))
}

const hashSha256 = async (message: string) => {
  const msgUint8 = new TextEncoder().encode(message)                           // encode as (utf-8) Uint8Array
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8)           // hash the message
  const hashArray = Array.from(new Uint8Array(hashBuffer))                     // convert buffer to byte array
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('') // convert bytes to hex string
  return hashHex
}
</script>
