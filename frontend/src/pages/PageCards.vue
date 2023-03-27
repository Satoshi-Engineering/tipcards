<template>
  <div class="mb-1 print:hidden max-w-md w-full m-auto">
    <BackLink class="p-4" :to="{ name: 'home', params: { lang: route.params.lang } }" />
    <div
      v-for="userWarning in userWarnings"
      :key="userWarning"
      class="bg-yellow-300 p-4 mb-1"
    >
      {{ userWarning }}
    </div>
    <div class="p-4 mb-3">
      <div class="my-2 flex justify-between items-center">
        <HeadlineDefault level="h2" class="!my-0">
          {{ t('cards.status.headline') }}
        </HeadlineDefault>
        <ButtonDefault
          variant="no-border"
          class="text-xs !text-black underline hover:no-underline active:no-underline disabled:no-underline"
          :disabled="reloadingStatusForCards"
          @click="reloadStatusForCards()"
        >
          {{ t('cards.status.reload') }}
        </ButtonDefault>
      </div>
      <ParagraphDefault
        v-if="cardsStatusList.length == 0"
        class="text-sm text-grey"
      >
        {{ t('cards.status.noCards') }}
      </ParagraphDefault>
      <div v-else>
        <div class="grid grid-cols-2 gap-3">
          <div
            class="border flex flex-col"
          >
            <div class="p-2 flex-1">
              <strong class="text-4xl">{{ usedCards.length }}</strong>
              <div class="text-sm text-lightningpurple uppercase">
                {{ t('cards.status.labelUsed', 2) }}
              </div>
            </div>
            <div class="border-t p-2">
              <strong>{{ usedCardsTotalAmount }}</strong> sats
            </div>
          </div>
          <div
            class="border flex flex-col"
          >
            <div class="p-2 flex-1">
              <strong class="text-4xl">{{ fundedCards.length }}</strong>
              <div class="text-sm text-btcorange uppercase">
                {{ t('cards.status.labelFunded', 2) }}
              </div>
            </div>
            <div class="border-t p-2">
              <strong>{{ fundedCardsTotalAmount }}</strong> sats
            </div>
          </div>
        </div>
        <ul class="w-full my-5">
          <li
            v-for="{ status, fundedDate, usedDate, shared, amount, note, cardHash, urlPreview, viewed } in cardsStatusList"
            :key="cardHash"
            class="py-1 border-b border-grey"
          >
            <CardStatusComponent
              :status="status || undefined"
              :funded-date="fundedDate || undefined"
              :used-date="usedDate || undefined"
              :shared="shared"
              :amount="amount || undefined"
              :note="note || undefined"
              :url="status === 'setFunding' ? setFundingHref : urlPreview"
              :viewed="viewed"
            />
          </li>
        </ul>
      </div>
    </div>
    <div class="p-4 mb-3">
      <HeadlineDefault level="h2">
        {{ t('cards.settings.headline') }}
      </HeadlineDefault>
      <label class="block mb-2">
        <span class="block">
          {{ t('cards.settings.numberOfCards') }}:
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
          {{ t('cards.settings.cardHeadline') }}:
        </span>
        <input
          v-model="settings.cardHeadline"
          type="text"
          class="w-full border my-1 px-3 py-2 focus:outline-none"
        >
      </label>
      <label class="block mb-2">
        <span class="block">
          {{ t('cards.settings.cardText') }}:
        </span>
        <textarea
          v-model="settings.cardCopytext"
          class="w-full border my-1 px-3 py-2 focus:outline-none"
          rows="4"
        />
      </label>
      <div class="mb-2">
        {{ t('cards.settings.cardQrCodeLogoLabel') }}:
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
        {{ t('cards.settings.cardQrCodeLogo.noLogo') }}
      </label>
    </div>
    <div class="px-4">
      <HeadlineDefault level="h2">
        {{ t('cards.actions.headline') }}
      </HeadlineDefault>
    </div>
    <div class="px-4 my-5">
      <HeadlineDefault level="h3" class="mb-2">
        {{ t('cards.actions.saveHeadline') }}
      </HeadlineDefault>
      <label class="block mb-1">
        <span class="block">
          {{ t('cards.actions.setName') }}:
        </span>
        <input
          v-model="settings.setName"
          type="text"
          class="w-full border my-1 px-3 py-2 focus:outline-none"
        >
      </label>
      <ButtonDefault class="text-sm min-w-[170px]" @click="saveCardsSet">
        {{ t('cards.actions.buttonSaveCardsSet') }}
        <i v-if="isSaved" class="bi bi-check-square-fill ml-1" />
        <i v-if="showSaveWarning" class="bi bi-exclamation-square ml-1" />
      </ButtonDefault>
      &nbsp;
      <br class="xs:hidden">
      <ButtonDefault
        v-if="isSaved"
        variant="no-border"
        class="text-sm"
        @click="deleteCardsSet"
      >
        {{ t('cards.actions.buttonDeleteCardsSet') }}
      </ButtonDefault>
    </div>
    <div class="px-4 my-5">
      <HeadlineDefault level="h3" class="mb-2">
        {{ t('cards.actions.printHeadline') }}
      </HeadlineDefault>
      <ButtonDefault
        class="text-sm min-w-[170px]"
        @click="printCards()"
      >
        {{ t('cards.actions.buttonPrint') }}
      </ButtonDefault>
      &nbsp;
      <br class="xs:hidden">
      <ButtonDefault
        variant="no-border"
        class="text-sm"
        @click="downloadZip()"
      >
        {{ t('cards.actions.buttonDownloadPngs') }}
      </ButtonDefault>
    </div>
    <div class="px-4 my-5">
      <HeadlineDefault level="h3" class="mb-2">
        {{ t('cards.actions.setFunding.headline') }}
      </HeadlineDefault>
      <ParagraphDefault class="text-sm">
        {{ t('cards.actions.setFunding.intro') }}
      </ParagraphDefault>
      <div class="mb-2">
        {{ t('cards.actions.setFunding.label') }}:
      </div>
      <ButtonWithTooltip
        class="text-sm min-w-[170px]"
        :href="setFundingHref"
        :disabled="cardsStatusList.length !== 0"
        :tooltip="cardsStatusList.length !== 0 ? t('cards.actions.setFunding.disabledReason') : undefined"
      >
        {{ t('cards.actions.setFunding.button') }}
      </ButtonWithTooltip>
    </div>
  </div>
  <div class="mb-1 p-4 print:hidden max-w-md w-full m-auto">
    <HeadlineDefault level="h2">
      {{ t('cards.cards.headline') }}
    </HeadlineDefault>
    <div v-if="cards.length > 0">
      <label class="block mb-2">
        <span class="block">
          {{ t('cards.cards.filterLabel') }}
        </span>
        <select
          v-model="cardsFilter"
          class="w-full border my-1 px-3 py-2"
        >
          <option value="">
            {{ t('cards.cards.filter.all') }} ({{ cards.length }})
          </option>
          <option value="unfunded">
            {{ t('cards.cards.filter.unfunded') }} ({{ cards.filter(card => card.status === 'unfunded').length }})
          </option>
          <option value="funded">
            {{ t('cards.cards.filter.funded') }} ({{ cards.filter(card => card.status === 'funded').length }})
          </option>
          <option value="used">
            {{ t('cards.cards.filter.used') }} ({{ cards.filter(card => card.status === 'used').length }})
          </option>
        </select>
      </label>
    </div>
    <div v-if="userErrorMessage != null">
      <p class="text-red-500 text-align-center" dir="ltr">
        {{ userErrorMessage }}
      </p>
    </div>
  </div>
  <div v-if="cards.length > 0" dir="ltr">
    <div class="w-full overflow-x-auto print:overflow-visible pb-4 print:pb-0">
      <div class="w-[210mm] mx-auto p-[10mm] pb-0 items-start justify-end text-xs text-right hidden print:flex">
        <div>
          Set ID:<br>
          <LinkDefault :href="currentSetUrl">{{ setId }}</LinkDefault>
        </div>
        <!-- eslint-disable vue/no-v-html -->
        <div
          class="inline-block w-[30mm] aspect-square mx-6"
          v-html="currentSetUrlQrCode"
        />
        <!-- eslint-enable vue/no-v-html -->
      </div>
      <div
        ref="cardsContainer"
        class="relative w-[210mm] mx-auto px-[15mm] py-[10mm] border-t print:border-0"
      >
        <div
          v-for="card in cardsFilter === '' ? cards : cards.filter(card => card.status === cardsFilter)"
          :key="card.url"
          class="relative break-inside-avoid w-[90mm] h-[55mm] float-left group"
        >
          <div class="group-odd:[inset-inline-start:0] group-even:[inset-inline-end:0] absolute border-l-[0.5px] opacity-50 h-3 -top-4" />
          <div class="group-odd:[inset-inline-start:0] group-even:[inset-inline-end:0] absolute border-l-[0.5px] opacity-50 h-3 -bottom-4" />
          <div class="hidden group-first:block [inset-inline-end:0] absolute border-l-[0.5px] opacity-50 h-3 -top-4" />
          <div class="hidden group-last:block [inset-inline-start:0] absolute border-l-[0.5px] opacity-50 h-3 -bottom-4" />

          <div class="group-odd:[inset-inline-start:-1rem] group-even:[inset-inline-end:-1rem] absolute border-t-[0.5px] opacity-50 w-3 top-0" />
          <div class="group-odd:[inset-inline-start:-1rem] group-even:[inset-inline-end:-1rem] absolute border-t-[0.5px] opacity-50 w-3 bottom-0" />      
          <div
            v-if="card.url != ''"
            class="absolute w-full h-full"
            :class="{ 'opacity-50': card.status === 'used' }"
          >
            <a :href="card.status === 'setFunding' ? setFundingHref : card.urlPreview">
              <div
                class="absolute top-7 bottom-7 left-3 w-auto h-auto aspect-square"
                :class="{ 'opacity-50 blur-sm': card.status === 'used' }"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="100%"
                  height="100%"
                  viewBox="0 0 256 256"
                  class="qr-code-svg"
                  :class="{ 'qr-code-svg--used': card.status === 'used' }"
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
              :dir="currentTextDirection"
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
          </div>
          <div
            v-if="card.status === 'error'"
            class="absolute flex right-0.5 top-0.5 px-2 py-1 rounded-full bg-red-500 text-white text-xs break-anywhere print:hidden"
          >
            <span class="m-auto">Error</span>
          </div>
          <div
            v-else-if="card.amount != null && card.status === 'funded'"
            class="absolute flex right-0.5 top-0.5 px-2 py-1 rounded-full bg-btcorange text-white text-xs break-anywhere"
          >
            <span class="m-auto">{{ card.amount }} sats</span>
          </div>
          <div
            v-else-if="card.amount != null && card.status === 'used'"
            class="absolute flex right-0.5 top-0.5 px-2 py-1 rounded-full bg-lightningpurple text-white text-xs break-anywhere"
          >
            <span class="m-auto">{{ card.amount }} sats</span>
          </div>
          <div
            v-else-if="(card.status === 'invoice' || card.status === 'lnurlp' || card.status === 'setFunding')"
            class="absolute flex right-0.5 top-0.5 px-2 py-1 rounded-full bg-grey text-white text-xs break-anywhere print:hidden"
          >
            <span
              v-if="card.status === 'lnurlp' && card.shared"
              :title="card.status"
              class="m-auto"
            >
              {{ t('cards.status.labelPendingSharedFunding') }}
            </span>
            <span
              v-else-if="(card.status === 'lnurlp' || card.status === 'invoice')"
              :title="card.status"
              class="m-auto"
            >
              {{ t('cards.status.labelPendingFunding') }}
            </span>
            <span
              v-else-if="card.status === 'setFunding'"
              :title="card.status"
              class="m-auto"
            >
              {{ t('cards.status.labelPendingSetFunding') }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { saveAs } from 'file-saver'
import JSZip from 'jszip'
import QRCode from 'qrcode-svg'
import sanitizeHtml from 'sanitize-html'
import { onMounted, ref, reactive, watch, computed, onBeforeMount } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import throttle from 'lodash.throttle'
import isEqual from 'lodash.isequal'

import { useI18nHelpers } from '@/modules/initI18n'
import BackLink from '@/components/BackLink.vue'
import IconBitcoin from '@/components/svgs/IconBitcoin.vue'
import IconLightning from '@/components/svgs/IconLightning.vue'
import HeadlineDefault from '@/components/typography/HeadlineDefault.vue'
import LinkDefault from '@/components/typography/LinkDefault.vue'
import ParagraphDefault from '@/components/typography/ParagraphDefault.vue'
import ButtonDefault from '@/components/ButtonDefault.vue'
import CardStatusComponent from '@/components/CardStatus.vue'
import ButtonWithTooltip from '@/components/ButtonWithTooltip.vue'
import {
  type Settings,
  getDefaultSettings,
  useCardsSets,
  encodeCardsSetSettings,
  decodeCardsSetSettings,
} from '@/modules/cardsSets'
import { loadCardStatus, type CardStatus } from '@/modules/loadCardStatus'
import svgToPng from '@/modules/svgToPng'
import { BACKEND_API_ORIGIN } from '@/constants'
import { encodeLnurl } from '@root/modules/lnurlHelpers'
import { useSeoHelpers } from '@/modules/seoHelpers'
import hashSha256 from '@/modules/hashSha256'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const { currentTextDirection } = useI18nHelpers()
const { setDocumentTitle } = useSeoHelpers()
const {
  savedCardsSets,
  loadSavedCardsSets,
  saveCardsSet: saveCardsSetToLocalStorage,
  deleteCardsSet: deleteCardsSetFromLocalStorage,
} = useCardsSets()

///////////////////////
// CARDS SETS + SETTINGS
//
const setId = computed(() => route.params.setId == null || route.params.setId === '' ? undefined : String(route.params.setId))

const settings = reactive(getDefaultSettings())

const saveCardsSet = () => {
  if (setId.value == null) {
    return
  }
  if (!hasBeenSaved.value && !confirm(t('cards.actions.saveSetConfirm'))) {
    return
  }
  saveCardsSetToLocalStorage({
    setId: setId.value,
    settings,
    date: new Date().toISOString(),
  })
}

const deleteCardsSet = () => {
  if (setId.value == null) {
    return
  }
  if (!confirm(t('cards.actions.deleteSetConfirm'))) {
    return
  }
  deleteCardsSetFromLocalStorage(setId.value)
  router.push({ name: 'home', params: { lang: route.params.lang } })
}

const currentSetUrl = ref<string>(document.location.href)
const currentSetUrlQrCode = computed(() => new QRCode({
    content: currentSetUrl.value,
    padding: 0,
    join: true,
    xmlDeclaration: false,
    container: 'svg-viewbox',
  }).svg(),
)

const putSettingsIntoUrl = async () => {
  if (setId.value == null) {
    return
  }

  let settingsForUrl = ''
  if (!isEqual(settings, getDefaultSettings())) {
    settingsForUrl = encodeCardsSetSettings(settings)
  }
  
  router.replace({
    ...route,
    params: {
      ...route.params,
      settings: settingsForUrl,
    },
  })

  setDocumentTitle(settings.setName !== '' ? settings.setName : t('index.unnamedSetNameFallback'))
}

watch(settings, () => {
  putSettingsIntoUrl()
  repopulateCards()
})

const urlChanged = () => {
  const settingsEncoded = String(route.params.settings)
  let settingsDecoded: Settings | undefined = undefined
  try {
    settingsDecoded = decodeCardsSetSettings(settingsEncoded)
  } catch (e) {
    // do nothing
  }
  Object.assign(settings, settingsDecoded)
  repopulateCards()
  loadSavedCardsSets()
  currentSetUrl.value = document.location.href
}

onMounted(() => {
  urlChanged()
  putSettingsIntoUrl()
})

// https://gitlab.satoshiengineering.com/satoshiengineering/projects/-/issues/425
window.addEventListener('pageshow', () => reloadStatusForCards())

watch(() => route.fullPath, urlChanged)

const hasBeenSaved = computed(() => {
  return savedCardsSets.value.some(savedSet => savedSet.setId === setId.value)
})

const isSaved = computed(() => {
  if (!hasBeenSaved.value) {
    return false
  }
  return savedCardsSets.value.some(savedSet => savedSet.setId === setId.value && isEqual(savedSet.settings, settings))
})

const showSaveWarning = computed(() => {
  if (isSaved.value) {
    return false
  }
  if (hasBeenSaved.value) {
    return true
  }
  if (cards.value.some(card => card.status === 'funded' || card.status === 'used')) {
    return true
  }
  if (wasPrintedOrDownloaded.value) {
    return true
  }
  return false
})

const setFundingHref = computed(() => router.resolve({
  name: 'set-funding',
  params: {
    lang: route.params.lang,
    setId: route.params.setId,
    settings: route.params.settings,
  },
}).href)

///////////////////////
// CARDS
//
const wasPrintedOrDownloaded = ref(false)

type Card = {
  cardHash: string,
  url: string,
  urlPreview: string,
  lnurl: string,
  status: string | null,
  amount: number | null,
  note: string | null,
  shared: boolean,
  fundedDate: number | null,
  usedDate: number | null,
  createdDate: number | null,
  viewed: boolean,
  qrCodeSvg: string,
}
const cards = ref<Card[]>([])
const userErrorMessage = ref<string | undefined>(undefined)
const userWarnings = ref<string[]>([])

const cardsFilter = ref('')

const cardsContainer = ref<HTMLElement | undefined>(undefined)

const cardCopytextComputed = computed(() => settings.cardCopytext
  .replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1<br>$2'),
)

const createNewCards = () => {
  router.replace({ ...route, params: { ...route.params, setId: crypto.randomUUID(), settings: '' } })
}

onBeforeMount(() => {
  if (setId.value == null) {
    createNewCards()
  }
})

const getCardUrl = (lnurlEncoded: string, landingPageType: 'landing' | 'preview') => {
  const routeHref = router.resolve({ name: landingPageType, params: { lang: route.params.lang }, query: { lightning: lnurlEncoded.toUpperCase() } }).href
  if (landingPageType === 'preview') {
    return routeHref
  }
  return `${location.protocol}//${location.host}${routeHref}`
}

const getQrCodeForUrl = (url: string) => 
  new QRCode({
        content: url,
        padding: 0,
        join: true,
        xmlDeclaration: false,
        container: 'none',
      }).svg()

const generateNewCardSkeleton = async (index: number) => {
  const cardHash = await hashSha256(`${setId.value}/${index}`)
  const lnurlDecoded = `${BACKEND_API_ORIGIN}/api/lnurl/${cardHash}`
  const lnurlEncoded = encodeLnurl(lnurlDecoded)
  const url = getCardUrl(lnurlEncoded, 'landing')
  const urlPreview = getCardUrl(lnurlEncoded, 'preview')
  return {
    cardHash,
    url,
    urlPreview,
    lnurl: lnurlEncoded,
    status: null,
    amount: null,
    note: null,
    fundedDate: null,
    usedDate: null,
    createdDate: null,
    viewed: false,
    shared: false,
    qrCodeSvg: getQrCodeForUrl(url),
  }
}

const reloadingStatusForCards = ref(false)
const reloadStatusForCards = throttle(async () => {
  reloadingStatusForCards.value = true
  await Promise.all(cards.value.map(async (card) => {
    // the URLs need to change in case the language was switched
    card.url = getCardUrl(card.lnurl, 'landing')
    card.urlPreview = getCardUrl(card.lnurl, 'preview')
    card.qrCodeSvg = getQrCodeForUrl(card.url)
    const { status, amount, shared, message, fundedDate, createdDate, card: cardData } = await loadCardStatus(card.cardHash, 'cards')
    if (status === 'error') {
      card.status = 'error'
      userErrorMessage.value = message || 'Unknown error for LNURL.'
      return
    }
    card.status = status
    card.shared = shared || false
    card.amount = amount || null
    card.note = cardData?.note || null
    card.fundedDate = fundedDate || null
    card.usedDate = cardData?.used || null
    card.createdDate = createdDate || null
    card.viewed = cardData?.landingPageViewed != null
  }))
  reloadingStatusForCards.value = false
}, 1000)

const repopulateCards = async () => {
  if (setId.value == null) {
    cards.value = []
    return
  }
  settings.numberOfCards = Math.max(Math.min(settings.numberOfCards, 100), 0)
  cards.value.splice(settings.numberOfCards)
  for (let i = 0; i < settings.numberOfCards; i+=1) {
    if (cards.value[i] != null) {
      continue
    }
    cards.value[i] = await generateNewCardSkeleton(i)
  }
  reloadStatusForCards()
}

const downloadZip = async (format: 'png' | 'svg' = 'png') => {
  const zip = new JSZip()
  if (cardsContainer.value == null) {
    return
  }
  const fileExtension = format
  await Promise.all(Array.from(cardsContainer.value.querySelectorAll('.qr-code-svg:not(.qr-code-svg--used)'))
    .map(async (svgEl, index) => {
      let fileContent: string | Blob = svgEl.outerHTML
      if (format === 'png') {
        fileContent = (await svgToPng({ width: 2000, height: 2000, svg: svgEl.outerHTML }) || 'error')
      }
      zip.file(`qrCode_${index}_${setId.value}.${fileExtension}`, fileContent)
    }))
  const zipFileContent = await zip.generateAsync({ type: 'blob' })
  saveAs(zipFileContent, `qrCodes_${setId.value}_${fileExtension}.zip`)
  wasPrintedOrDownloaded.value = true
}

const printCards = () => {
  window.print()
  wasPrintedOrDownloaded.value = true
}

///////////////////////
// STATUS
//
const usedCards = computed(() => cards.value.filter(({ status }) => status === 'used'))
const usedCardsTotalAmount = computed(() => usedCards.value.reduce((total, { amount }) => total + (amount || 0), 0))

const fundedCards = computed(() => cards.value.filter(({ status }) => status === 'funded'))
const fundedCardsTotalAmount = computed(() => fundedCards.value.reduce((total, { amount }) => total + (amount || 0), 0))

const statusOrder: Record<CardStatus['status'], number> = {
  invoice: 0,
  lnurlp: 0,
  setFunding: 0,
  funded: 1,
  used: 2,
  unfunded: 3,
  error: 4,
}

const cardsStatusList = computed(
  () => cards.value
    .filter(({ status }) => status != null && status !== 'unfunded')
    .sort((a, b) => {
      if (statusOrder[a.status as CardStatus['status']] !== statusOrder[b.status as CardStatus['status']]) {
        return statusOrder[a.status as CardStatus['status']] - statusOrder[b.status as CardStatus['status']]
      }
      if (a.usedDate != null && b.usedDate != null) {
        return b.usedDate - a.usedDate
      }
      if (a.fundedDate != null && b.fundedDate != null) {
        return b.fundedDate - a.fundedDate
      }
      if (a.createdDate != null && b.createdDate != null) {
        return b.createdDate - a.createdDate
      }
      return 0
    }),
)

</script>

<style>
  @media print {
    @page {
      margin: 0mm;
      size: A4 portrait;
    }
    html {
      margin: 0;
      background: #ffffff;
    }
  }
</style>
