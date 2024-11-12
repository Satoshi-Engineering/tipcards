<template>
  <TheLayout login-banner>
    <CenterContainer class="print:hidden">
      <BackLink
        :to="{ name: 'sets', params: { lang: $route.params.lang } }"
      >
        {{ t('sets.title') }}
      </BackLink>
      <div
        v-for="userWarning in userWarnings"
        :key="userWarning"
        class="bg-yellow p-4 mb-1"
      >
        {{ userWarning }}
      </div>
      <div class="pb-4 mb-3">
        <header class="text-center mb-7">
          <IconLightningBolt class="text-yellow w-6 h-auto inline-block" />
          <HeadlineDefault level="h1" class="mt-3">
            {{ pageTitle }}
          </HeadlineDefault>
        </header>
        <div class="mb-2 flex justify-between items-center">
          <HeadlineDefault level="h2" class="!my-0">
            {{ t('cards.status.headline') }}
          </HeadlineDefault>
          <ButtonDefault
            variant="secondary"
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
          <CardsSummaryContainer>
            <CardsSummary
              color="green"
              :cards-count="usedCards.length"
              :title="$t('cards.status.labelUsed', 2)"
              :sats="usedCardsTotalAmount"
            />
            <CardsSummary
              color="yellow"
              :cards-count="fundedCards.length"
              :title="$t('cards.status.labelFunded', 2)"
              :sats="fundedCardsTotalAmount"
            />
          </CardsSummaryContainer>
          <ul class="w-full my-5">
            <li
              v-for="{ status, fundedDate, usedDate, shared, amount, note, cardHash, urlLandingWithCardHash, urlFunding, viewed, isLockedByBulkWithdraw } in cardsStatusList"
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
                :url="
                  status === 'setFunding'
                    ? setFundingHref
                    : fundedDate == null
                      ? urlFunding
                      : urlLandingWithCardHash
                "
                :viewed="viewed"
                :is-locked-by-bulk-withdraw="isLockedByBulkWithdraw"
              />
            </li>
          </ul>
        </div>
      </div>
      <div class="py-4 mb-3">
        <HeadlineDefault level="h2">
          {{ t('cards.settings.headline') }}
        </HeadlineDefault>
        <label class="block mb-2">
          <span class="block">
            {{ t('cards.settings.numberOfCards') }}:
          </span>
          <input
            v-model.lazy.number="settings.numberOfCards"
            type="number"
            inputmode="numeric"
            min="1"
            max="100"
            class="w-full border my-1 px-3 py-2 focus:outline-none"
          >
        </label>
        <label class="block mb-2">
          <span class="block">
            {{ t('cards.settings.cardHeadline') }}:
          </span>
          <input
            v-model.lazy.trim="settings.cardHeadline"
            type="text"
            class="w-full border my-1 px-3 py-2 focus:outline-none"
          >
        </label>
        <label class="block mb-2">
          <span class="block">
            {{ t('cards.settings.cardText') }}:
          </span>
          <textarea
            v-model.lazy.trim="settings.cardCopytext"
            class="w-full border my-1 px-3 py-2 focus:outline-none"
            rows="4"
          />
        </label>
        <div class="mb-2">
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
          <label
            v-for="image in availableCardLogos"
            :key="image.id"
            class="block"
          >
            <input
              v-model="settings.cardsQrCodeLogo"
              type="radio"
              :value="image.id"
            >
            {{ image.name }}
          </label>
          <label class="block">
            <input
              v-model="settings.cardsQrCodeLogo"
              :value="null"
              type="radio"
            >
            {{ t('cards.settings.cardQrCodeLogo.noLogo') }}
          </label>
        </div>
        <div v-if="landingPages?.length" class="mb-2">
          <div class="mb-2">
            {{ t('setFunding.form.landingPagesHeadline') }}
            <small class="block">({{ t('setFunding.form.landingPagesHint') }})</small>
          </div>
          <label class="block">
            <input
              v-model="settings.landingPage"
              value="default"
              type="radio"
            >
            tipcards.io
          </label>
          <label
            v-for="landingPage in landingPages"
            :key="landingPage.id"
            class="block"
          >
            <input
              v-model="settings.landingPage"
              type="radio"
              :value="landingPage.id"
            >
            {{ landingPage.name }}
          </label>
        </div>
      </div>
      <div>
        <HeadlineDefault level="h2">
          {{ t('cards.actions.headline') }}
        </HeadlineDefault>
      </div>
      <div class="my-5">
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
            :disabled="saving"
          >
        </label>
        <div v-if="savingError != null">
          <ParagraphDefault class="text-red-500" dir="ltr">
            {{ savingError }}
          </ParagraphDefault>
        </div>
        <div v-if="deletingError != null">
          <ParagraphDefault class="text-red-500" dir="ltr">
            {{ deletingError }}
          </ParagraphDefault>
        </div>
        <ParagraphDefault v-if="!isLoggedIn" class="text-sm">
          <I18nT keypath="localStorageDeprecation.loginCta">
            <template #loginCtaAction>
              <LinkDefault @click="showModalLogin = true">{{ $t('localStorageDeprecation.loginCtaAction') }}</LinkDefault>
            </template>
          </I18nT>
        </ParagraphDefault>
        <ButtonContainer>
          <ButtonWithTooltip
            data-test="save-cards-set"
            :disabled="saving || (!isLoggedIn && !hasBeenSaved && !features.includes('saveLocal'))"
            :tooltip="!saving && !isLoggedIn && !hasBeenSaved && !features.includes('saveLocal') ? t('cards.actions.buttonSaveDisabledTooltip') : undefined"
            :loading="saving"
            @click="saveCardsSet"
          >
            <span>
              {{ t('cards.actions.buttonSaveCardsSet') }}
            </span>
            <IconCheckSquareFill v-if="isSaved && !saving" class="inline-block ms-2 h-[1em] w-[1em]" />
            <IconExclamationSquare v-else-if="showSaveWarning && !saving" class="inline-block ms-2 h-[1em] w-[1em]" />
            <span v-else-if="saving" class="inline-block ms-2 h-[1em] w-[1em]" />
          </ButtonWithTooltip>
          <ButtonDefault
            variant="secondary"
            :disabled="deleting || !isSaved"
            :loading="deleting"
            @click="deleteCardsSet"
          >
            {{ t('cards.actions.buttonDeleteCardsSet') }}
          </ButtonDefault>
        </ButtonContainer>
      </div>
      <div class="my-5">
        <HeadlineDefault level="h3" class="mb-2">
          {{ t('cards.actions.printHeadline') }}
        </HeadlineDefault>
        <ButtonContainer>
          <ButtonDefault
            @click="printCards()"
          >
            {{ t('cards.actions.buttonPrint') }}
          </ButtonDefault>
          <ButtonDefault
            variant="secondary"
            @click="downloadZip()"
          >
            {{ t('cards.actions.buttonDownloadPngs') }}
          </ButtonDefault>
        </ButtonContainer>
      </div>
      <SetFunding
        class="my-5"
        :set="set"
        :cards="cards"
      />
      <BulkWithdraw
        v-if="isLoggedIn"
        class="my-5"
        :amount-to-withdraw="fundedCardsTotalAmount"
      />
    </CenterContainer>
    <CenterContainer class="print:hidden">
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
    </CenterContainer>
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
            :key="card.urlLandingWithLnurl"
            class="relative break-inside-avoid w-[90mm] h-[55mm] float-left group"
          >
            <div class="group-odd:[inset-inline-start:0] group-even:[inset-inline-end:0] absolute border-l-[0.5px] opacity-50 h-3 -top-4" />
            <div class="group-odd:[inset-inline-start:0] group-even:[inset-inline-end:0] absolute border-l-[0.5px] opacity-50 h-3 -bottom-4" />
            <div class="hidden group-first:block [inset-inline-end:0] absolute border-l-[0.5px] opacity-50 h-3 -top-4" />
            <div class="hidden group-last:block [inset-inline-start:0] absolute border-l-[0.5px] opacity-50 h-3 -bottom-4" />

            <div class="group-odd:[inset-inline-start:-1rem] group-even:[inset-inline-end:-1rem] absolute border-t-[0.5px] opacity-50 w-3 top-0" />
            <div class="group-odd:[inset-inline-start:-1rem] group-even:[inset-inline-end:-1rem] absolute border-t-[0.5px] opacity-50 w-3 bottom-0" />
            <div
              v-if="card.urlLandingWithLnurl != ''"
              class="absolute w-full h-full"
              :class="{ 'opacity-50': card.status === 'used' }"
            >
              <a
                :href="
                  card.status === 'setFunding'
                    ? setFundingHref
                    : card.fundedDate == null
                      ? card.urlFunding
                      : card.urlLandingWithCardHash
                "
                :data-lnurl="card.status !== 'setFunding' && card.fundedDate != null ? card.urlLandingWithLnurl : undefined"
              >
                <div
                  class="absolute top-7 bottom-7 left-3 w-auto h-auto aspect-square"
                  :class="{ 'opacity-50 blur-sm': card.status === 'used' || card.isLockedByBulkWithdraw }"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="100%"
                    height="100%"
                    viewBox="0 0 256 256"
                    class="qr-code-svg"
                    :class="{ 'qr-code-svg--used': card.status === 'used' || card.isLockedByBulkWithdraw }"
                  >
                    <!-- eslint-disable vue/no-v-html -->
                    <g v-html="card.qrCodeSvg" />
                    <!-- eslint-enable vue/no-v-html -->
                    <IconLogoBitcoin
                      v-if="settings.cardsQrCodeLogo === 'bitcoin'"
                      :width="0.26 * 256"
                      :height="0.26 * 256"
                      :x="0.37 * 256"
                      :y="0.37 * 256"
                    />
                    <IconLogoLightning
                      v-else-if="settings.cardsQrCodeLogo === 'lightning'"
                      :width="0.26 * 256"
                      :height="0.26 * 256"
                      :x="0.37 * 256"
                      :y="0.37 * 256"
                    />
                    <svg
                      v-else-if="selectedCardLogo != null"
                      :width="0.3 * 256"
                      :height="0.3 * 256"
                      :x="0.35 * 256"
                      :y="0.35 * 256"
                    >
                      <image
                        :href="`${BACKEND_API_ORIGIN}/api/assets/cardLogos/${selectedCardLogo.id}.${selectedCardLogo.type}`"
                        :width="0.3 * 256"
                        :height="0.3 * 256"
                      />
                    </svg>
                  </svg>
                </div>
              </a>
              <section
                class="absolute left-1/2 ml-2 mr-4 top-0 bottom-2 flex items-center"
                :class="{ 'opacity-50 blur-sm': card.status === 'used' || card.isLockedByBulkWithdraw }"
                :dir="currentTextDirection"
              >
                <article>
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
                    v-html="sanitizeI18n(cardCopytextComputed)"
                  />
                  <!-- eslint-enable vue/no-v-html vue/no-v-text-v-html-on-component -->
                </article>
              </section>
            </div>
            <div
              v-if="card.status === 'error'"
              class="absolute flex right-0.5 top-0.5 px-2 py-1 rounded-full bg-red text-white text-xs break-anywhere print:hidden"
            >
              <span class="m-auto">Error</span>
            </div>
            <div
              v-else-if="card.amount != null && card.status === 'used'"
              class="absolute flex right-0.5 top-0.5 px-2 py-1 rounded-full bg-green-light text-green text-xs break-anywhere print:hidden"
            >
              <span class="m-auto">{{ card.amount }} sats</span>
            </div>
            <div
              v-else-if="card.isLockedByBulkWithdraw"
              class="absolute flex right-0.5 top-0.5 px-2 py-1 rounded-full bg-white border-2 border-yellow text-yellow-dark text-xs break-anywhere print:hidden"
            >
              <span class="m-auto">{{ t('cards.status.labelIsLockedByBulkWithdraw') }}</span>
            </div>
            <div
              v-else-if="card.amount != null && card.status === 'funded'"
              class="absolute flex right-0.5 top-0.5 px-2 py-1 rounded-full bg-yellow-light text-yellow-dark text-xs break-anywhere print:hidden"
            >
              <span class="m-auto">{{ card.amount }} sats</span>
            </div>
            <div
              v-else-if="(card.status === 'invoice' || card.status === 'lnurlp' || card.status === 'setFunding')"
              class="absolute flex right-0.5 top-0.5 px-2 py-1 rounded-full bg-white border-2 border-yellow text-yellow-dark text-xs break-anywhere print:hidden"
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
  </TheLayout>
</template>

<script lang="ts" setup>
import axios from 'axios'
import { saveAs } from 'file-saver'
import JSZip from 'jszip'
import { storeToRefs } from 'pinia'
import QRCode from 'qrcode-svg'
import { onMounted, ref, watch, computed, onBeforeMount, watchEffect, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import debounce from 'lodash.debounce'
import isEqual from 'lodash.isequal'

import type { Set } from '@shared/data/api/Set'
import type { Image as ImageMeta } from '@shared/data/api/Image'
import LNURL from '@shared/modules/LNURL/LNURL'

import TheLayout from '@/components/layout/TheLayout.vue'
import CenterContainer from '@/components/layout/CenterContainer.vue'
import BulkWithdraw from '@/components/cardActions/BulkWithdraw.vue'
import SetFunding from '@/components/cardActions/SetFunding.vue'
import IconLogoBitcoin from '@/components/icons/IconLogoBitcoin.vue'
import IconLogoLightning from '@/components/icons/IconLogoLightning.vue'
import HeadlineDefault from '@/components/typography/HeadlineDefault.vue'
import LinkDefault from '@/components/typography/LinkDefault.vue'
import ParagraphDefault from '@/components/typography/ParagraphDefault.vue'
import ButtonDefault from '@/components/buttons/ButtonDefault.vue'
import CardStatusComponent from '@/components/CardStatus.vue'
import ButtonWithTooltip from '@/components/ButtonWithTooltip.vue'
import CardsSummary from '@/components/CardsSummaryDeprecated.vue'
import CardsSummaryContainer from '@/components/CardsSummaryDeprecatedContainer.vue'
import IconCheckSquareFill from '@/components/icons/IconCheckSquareFill.vue'
import IconExclamationSquare from '@/components/icons/IconExclamationSquare.vue'
import { loadCardStatus, type CardStatusDeprecated } from '@/modules/loadCardStatus'
import svgToPng from '@/modules/svgToPng'
import { useI18nHelpers } from '@/modules/initI18n'
import { useSeoHelpers } from '@/modules/seoHelpers'
import hashSha256 from '@/modules/hashSha256'
import useNewFeatures from '@/modules/useNewFeatures'
import useLandingPages from '@/modules/useLandingPages'
import useSetFunding from '@/modules/useSetFunding'
import useSetSettingsFromUrl from '@/modules/useSetSettingsFromUrl'
import useLocalStorageSets from '@/modules/useLocalStorageSets'
import { useAuthStore } from '@/stores/auth'
import { useCardsSetsStore } from '@/stores/cardsSets'
import { useModalLoginStore } from '@/stores/modalLogin'
import { BACKEND_API_ORIGIN } from '@/constants'
import sanitizeI18n from '@/modules/sanitizeI18n'
import BackLink from '@/components/BackLink.vue'
import IconLightningBolt from '@/components/icons/IconLightningBolt.vue'
import ButtonContainer from '@/components/buttons/ButtonContainer.vue'

// this is just for debugging purposes,
// as it enables saving the current set to localStorage via the browser console
useLocalStorageSets()

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const { currentTextDirection } = useI18nHelpers()
const { setDocumentTitle } = useSeoHelpers()

const { features } = useNewFeatures()

const { isLoggedIn } = storeToRefs(useAuthStore())

const cardsStore = useCardsSetsStore()
const { subscribe, saveSet, deleteSet } = cardsStore
const { sets } = storeToRefs(cardsStore)

const { showModalLogin } = storeToRefs(useModalLoginStore())

///////////////////////
// CARDS SETS + SETTINGS
//
const { settings } = useSetSettingsFromUrl()
const setId = computed(() => route.params.setId == null || route.params.setId === '' ? undefined : String(route.params.setId))
const saving = ref(false)
const savingError = ref<string>()
const deleting = ref(false)
const deletingError = ref<string>()

const saveCardsSet = async () => {
  if (setId.value == null) {
    return
  }
  if (!isLoggedIn.value && !hasBeenSaved.value && !confirm(t('cards.actions.saveSetConfirm'))) {
    return
  }

  saving.value = true
  savingError.value = undefined
  try {
    let created = Math.floor(+ new Date() / 1000)
    const currentSet = sets.value.find(({ id }) => id === setId.value)
    if (currentSet?.created != null) {
      created = currentSet.created
    }
    await saveSet({
      id: setId.value,
      settings,
      date: Math.floor(+ new Date() / 1000),
      created,
      userId: null,
      text: '',
      note: '',
      invoice: null,
    })
  } catch (error) {
    console.error(error)
    savingError.value = t('cards.errors.unableToSaveSet')
  } finally {
    saving.value = false
  }
}

const deleteCardsSet = async () => {
  if (setId.value == null) {
    return
  }
  if (!confirm(
    isLoggedIn.value
      ? t('cards.actions.deleteSetOnServerConfirm')
      : t('cards.actions.deleteSetConfirm'),
  )) {
    return
  }

  deleting.value = true
  deletingError.value = undefined
  try {
    await deleteSet(setId.value)
    router.push({ name: 'sets', params: { lang: route.params.lang } })
  } catch (error) {
    console.error(error)
    savingError.value = t('cards.errors.unableToDeleteSet')
  } finally {
    deleting.value = false
  }
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

const pageTitle = computed(() => settings.setName || t('cards.title'))

watchEffect(() => {
  setDocumentTitle(pageTitle.value)
})

const initializeCards = async () => {
  await repopulateCards()
  subscribe()
  currentSetUrl.value = document.location.href
}

watch([setId, settings], initializeCards)

onMounted(() => {
  loadAvailableCardLogos()
  initializeCards()
})

// https://gitlab.satoshiengineering.com/satoshiengineering/projects/-/issues/425
window.addEventListener('pageshow', () => reloadStatusForCards())

const hasBeenSaved = computed(() => {
  return sets.value.some(({ id }) => id === setId.value)
})

const isSaved = computed(() => {
  if (!hasBeenSaved.value) {
    return false
  }
  return sets.value.some((set) => set.id === setId.value && isEqual(set.settings, settings))
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

const { setFundingHref } = useSetFunding()

const availableCardLogos = ref<ImageMeta[]>([])
const loadAvailableCardLogos = async () => {
  if (!isLoggedIn.value) {
    return
  }
  const response = await axios.get(`${BACKEND_API_ORIGIN}/api/cardLogos/`)
  availableCardLogos.value = response.data.data
}
const availableCardLogosById = computed<Record<string, ImageMeta>>(() => availableCardLogos.value.reduce((byId, image) => ({
  ...byId,
  [image.id]: image,
}), {}))

const selectedCardLogo = computed(() => {
  if (
    settings.cardsQrCodeLogo == null
    || availableCardLogosById.value[settings.cardsQrCodeLogo] == null
  ) {
    return null
  }
  return availableCardLogosById.value[settings.cardsQrCodeLogo]
})

///////////////////////
// CARDS
//
const wasPrintedOrDownloaded = ref(false)

type Card = {
  cardHash: string,
  urlLandingWithLnurl: string,
  urlLandingWithCardHash: string,
  urlFunding: string,
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
  isLockedByBulkWithdraw: boolean,
}
const cards = ref<Card[]>([])
const userErrorMessage = ref<string | undefined>(undefined)
const userWarnings = ref<string[]>([])

const cardsFilter = ref('')

const cardsContainer = ref<HTMLElement | undefined>(undefined)

const cardCopytextComputed = computed(() => settings.cardCopytext
  .replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1<br>$2'),
)

const createNewCards = async () => {
  await nextTick()
  router.replace({ ...route, name: 'cards', params: { ...route.params, setId: crypto.randomUUID(), settings: '' } })
}

onBeforeMount(() => {
  if (setId.value == null) {
    createNewCards()
  }
})

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
  const lnurlEncoded = LNURL.encode(lnurlDecoded)
  const urlLandingWithLnurl = getLandingPageUrlWithLnurl(cardHash, settings.landingPage || undefined)
  const urlLandingWithCardHash = getLandingPageUrlWithCardHash(cardHash, settings.landingPage || undefined)
  const urlFunding = router.resolve({
    name: 'funding',
    params: { lang: route.params.lang, cardHash },
  }).href
  return {
    cardHash,
    urlLandingWithLnurl,
    urlLandingWithCardHash,
    urlFunding,
    lnurl: lnurlEncoded,
    status: null,
    amount: null,
    note: null,
    fundedDate: null,
    usedDate: null,
    createdDate: null,
    viewed: false,
    shared: false,
    qrCodeSvg: getQrCodeForUrl(urlLandingWithLnurl),
    isLockedByBulkWithdraw: false,
  }
}

const set = ref<Set>()
const reloadingStatusForCards = ref(false)
const reloadStatusForCards = debounce(async () => {
  // load set to trigger set funding invoice check (if webhook didn't work)
  try {
    const response = await axios.get(`${BACKEND_API_ORIGIN}/api/set/${setId.value}`)
    if (response.data.status === 'success' && response.data.data != null) {
      set.value = response.data.data
    } else {
      set.value = undefined
    }
  } catch(error) {
    set.value = undefined
    console.error(error)
  }

  reloadingStatusForCards.value = true
  await Promise.all(cards.value.map(async (card) => {
    // the URLs need to change in case the language was switched
    card.urlLandingWithLnurl = getLandingPageUrlWithLnurl(card.cardHash, settings.landingPage || undefined)
    card.urlLandingWithCardHash = getLandingPageUrlWithCardHash(card.cardHash, settings.landingPage || undefined)
    card.qrCodeSvg = getQrCodeForUrl(card.urlLandingWithLnurl)
    const { status, amount, shared, message, fundedDate, createdDate, card: cardData } = await loadCardStatus(card.cardHash)
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
    card.isLockedByBulkWithdraw = !!cardData?.isLockedByBulkWithdraw
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
  await Promise.all(Array.from(cardsContainer.value.querySelectorAll('.qr-code-svg'))
    .map(async (svgEl, index) => {
      if (svgEl.matches('.qr-code-svg--used')) {
        return
      }
      let fileContent: string | Blob = svgEl.outerHTML
      if (format === 'png') {
        fileContent = (await svgToPng({ width: 2000, height: 2000, svg: svgEl.outerHTML }) || 'error')
      }
      zip.file(`qrCode_${index + 1}_${setId.value}.${fileExtension}`, fileContent)
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

const statusOrder: Record<CardStatusDeprecated['status'], number> = {
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
      if (statusOrder[a.status as CardStatusDeprecated['status']] !== statusOrder[b.status as CardStatusDeprecated['status']]) {
        return statusOrder[a.status as CardStatusDeprecated['status']] - statusOrder[b.status as CardStatusDeprecated['status']]
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

/////
// Landing Page
const {
  landingPages,
  getLandingPageUrlWithLnurl,
  getLandingPageUrlWithCardHash,
} = useLandingPages()
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
