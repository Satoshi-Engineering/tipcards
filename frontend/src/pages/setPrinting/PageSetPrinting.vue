<template>
  <TheLayout full-width>
    <CenterContainer full-width class="lg:flex justify-between gap-3">
      <aside class="print:hidden min-w-56 flex-1 lg:max-w-sm">
        <BackLink :to="{ name: 'set', params: { setId, lang: $route.params.lang } }" />
        <div v-if="!isLoggedIn" class="my-20">
          <ItemsListMessageNotLoggedIn />
        </div>
        <div v-else-if="loading" class="my-20 grid place-items-center">
          <IconAnimatedLoadingWheel class="w-10 h-10" />
        </div>
        <UserErrorMessages
          v-if="userErrorMessages.length > 0"
          :user-error-messages="userErrorMessages"
        />
        <HeadlineDefault v-if="set" level="h1">
          {{ displayName }}
        </HeadlineDefault>
        <SetPrintingConfigForm
          v-model="printSettings"
        />
        <ButtonContainer>
          <ButtonDefault @click="printPage">
            Print
          </ButtonDefault>
        </ButtonContainer>
        <ParagraphDefault>
          Please print with a scale of 100% and without margins.
        </ParagraphDefault>
      </aside>
      <div class="overflow-x-auto px-3 py-3 -mx-3 -my-3 print:overflow-x-visible print:px-0 print:py-0 print:mx-0 print:my-0">
        <template
          v-for="(page, pageIndex) in pages"
          :key="pageIndex"
        >
          <PaperCssSheet
            :width="printSettings.pageWidth"
            :height="printSettings.pageHeight"
            class="flex flex-wrap content-start"
            :style="{ paddingBlock: `${paddingVertical}mm`, paddingInline: `${paddingHorizontal}mm`, rowGap: `${printSettings.cardGapVertical}mm`, columnGap: `${printSettings.cardGapHorizontal}mm` }"
          >
            <SetPrintingCard
              v-for="indexOnPage in Array.from({ length: cardsPerPage }).fill(0).map((_, i) => i)"
              :key="`page-${pageIndex}_card-${indexOnPage}`"
              :style="{ width: `${printSettings.cardWidth}mm`, height: `${printSettings.cardHeight}mm` }"
              :index-on-page="indexOnPage"
              :cards-per-row="cardsPerRow"
              :cards-per-page="cardsPerPage"
              :card-gap-horizontal="printSettings.cardGapHorizontal"
              :card-gap-vertical="printSettings.cardGapVertical"
              :borders="printSettings.printBorders"
              :crop-marks="printSettings.printCropMarks"
              class="break-anywhere"
            >
              <template v-if="page[indexOnPage] != null" #default>
                <img
                  v-if="printSettings.frontSideImage"
                  :src="printSettings.frontSideImage"
                  class="absolute w-full h-full object-contain object-center"
                >
                <SetPrintingQrCode
                  class="absolute"
                  :style="{ width: `${printSettings.qrCodeSize}mm`, height: `${printSettings.qrCodeSize}mm`, top: `${printSettings.qrCodeY}mm`, insetInlineStart: `${printSettings.qrCodeX}mm` }"
                  :text="getLandingPageUrlWithLnurl(page[indexOnPage].hash, set?.settings.landingPage ?? undefined)"
                />
                <div
                  v-if="printSettings.printText && set != null"
                  class="absolute top-0 bottom-0 ms-3 me-4 flex items-center"
                  :style="{ insetInlineStart: `${printSettings.qrCodeX + printSettings.qrCodeSize}mm` }"
                >
                  <article>
                    <HeadlineDefault
                      v-if="set.settings.cardHeadline !== ''"
                      level="h1"
                      styling="h4"
                      class="mb-1"
                    >
                      {{ set.settings.cardHeadline }}
                    </HeadlineDefault>
                    <!-- eslint-disable vue/no-v-html vue/no-v-text-v-html-on-component -->
                    <ParagraphDefault
                      v-if="set.settings.cardCopytext !== ''"
                      class="text-sm leading-tight"
                      v-html="sanitizeI18n(set?.settings.cardCopytext)"
                    />
                    <!-- eslint-enable vue/no-v-html vue/no-v-text-v-html-on-component -->
                  </article>
                </div>
              </template>
            </SetPrintingCard>
          </PaperCssSheet>

          <PaperCssSheet
            v-if="printSettings.doubleSidedPrinting"
            :width="printSettings.pageWidth"
            :height="printSettings.pageHeight"
            class="flex flex-wrap flex-row-reverse content-start"
            :style="{ paddingBlock: `${paddingVertical}mm`, paddingInline: `${paddingHorizontal}mm`, rowGap: `${printSettings.cardGapVertical}mm`, columnGap: `${printSettings.cardGapHorizontal}mm` }"
          >
            <SetPrintingCard
              v-for="indexOnPage in Array.from({ length: cardsPerPage }).fill(0).map((_, i) => i)"
              :key="`page-${pageIndex}_card-${indexOnPage}`"
              :style="{ width: `${printSettings.cardWidth}mm`, height: `${printSettings.cardHeight}mm` }"
              :index-on-page="indexOnPage"
              :cards-per-row="cardsPerRow"
              :cards-per-page="cardsPerPage"
              :card-gap-horizontal="printSettings.cardGapHorizontal"
              :card-gap-vertical="printSettings.cardGapVertical"
              :borders="false"
              :crop-marks="false"
              is-backside
              class="break-anywhere"
            >
              <template v-if="page[indexOnPage] != null" #default>
                <div class="w-full h-full grid place-items-center relative overflow-hidden">
                  <img
                    v-if="printSettings.backSideImage"
                    :src="printSettings.backSideImage"
                    class="absolute w-full h-full object-contain object-center"
                  >
                  <IconLogo
                    v-else
                    class="w-2/5 h-2/5"
                  />
                </div>
              </template>
            </SetPrintingCard>
          </PaperCssSheet>
        </template>
      </div>
    </CenterContainer>
  </TheLayout>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'

import { useAuthStore } from '@/stores/auth'
import { useSet } from '@/modules/useSet'
import { useSeoHelpers } from '@/modules/seoHelpers'
import printSettingsPresets, { PrintSettings } from './printSettingsPresets'
import TheLayout from '@/components/layout/TheLayout.vue'
import ItemsListMessageNotLoggedIn from '@/components/itemsList/components/ItemsListMessageNotLoggedIn.vue'
import IconAnimatedLoadingWheel from '@/components/icons/IconAnimatedLoadingWheel.vue'
import UserErrorMessages from '@/components/UserErrorMessages.vue'
import HeadlineDefault from '@/components/typography/HeadlineDefault.vue'
import BackLink from '@/components/BackLink.vue'
import CenterContainer from '@/components/layout/CenterContainer.vue'
import useLandingPages from '@/modules/useLandingPages'
import PaperCssSheet from './components/PaperCssSheet.vue'
import type { CardStatusDto } from '@shared/data/trpc/CardStatusDto'
import SetPrintingCard from './components/SetPrintingCard.vue'
import SetPrintingQrCode from './components/SetPrintingQrCode.vue'
import sanitizeI18n from '@/modules/sanitizeI18n'
import ParagraphDefault from '@/components/typography/ParagraphDefault.vue'
import IconLogo from '@/components/icons/IconLogo.vue'
import SetPrintingConfigForm from './components/SetPrintingConfigForm.vue'
import ButtonDefault from '@/components/buttons/ButtonDefault.vue'
import ButtonContainer from '@/components/buttons/ButtonContainer.vue'

const props = defineProps({
  setId: {
    type: String,
    required: true,
  },
})

const { isLoggedIn } = storeToRefs(useAuthStore())
const { setDocumentTitle } = useSeoHelpers()
const { set, loading, userErrorMessages, displayName, cardStatuses } = useSet(props.setId)
const { getLandingPageUrlWithLnurl } = useLandingPages()

watch(set, (newVal) => {
  if (newVal == null) {
    return
  }
  setDocumentTitle(displayName.value)
  loadPrintSettings()
})

const printSettings = ref<PrintSettings>(printSettingsPresets[0])

const usablePageWidth = computed(() => printSettings.value.pageWidth - 2 * printSettings.value.minPrintMarginHorizontal)
const usablePageHeight = computed(() => printSettings.value.pageHeight - 2 * printSettings.value.minPrintMarginVertical)

const effectiveCardWidth = computed(() => printSettings.value.cardWidth + printSettings.value.cardGapHorizontal)
const effectiveCardHeight = computed(() => printSettings.value.cardHeight + printSettings.value.cardGapVertical)

const cardsPerRow = computed(() => Math.floor((usablePageWidth.value + printSettings.value.cardGapHorizontal) / effectiveCardWidth.value))
const cardsPerColumn = computed(() => Math.floor((usablePageHeight.value + printSettings.value.cardGapVertical) / effectiveCardHeight.value))

const paddingHorizontal = computed(() => (printSettings.value.pageWidth - effectiveCardWidth.value * cardsPerRow.value + printSettings.value.cardGapHorizontal) / 2)
const paddingVertical = computed(() => (printSettings.value.pageHeight - effectiveCardHeight.value * cardsPerColumn.value + printSettings.value.cardGapVertical) / 2)

const cardsPerPage = computed(() => cardsPerRow.value * cardsPerColumn.value)

const pages = computed<CardStatusDto[][]>(() => {
  const pages: CardStatusDto[][] = []
  let currentPage: CardStatusDto[] = []
  for (const card of cardStatuses.value) {
    currentPage.push(card)
    if (currentPage.length === cardsPerPage.value) {
      pages.push(currentPage)
      currentPage = []
    }
  }
  if (currentPage.length > 0) {
    pages.push(currentPage)
  }
  return pages
})

const printPage = () => {
  window.print()
}

watch(printSettings, () => {
  if (set.value == null) {
    return
  }
  storePrintSettingsForSet()
  storeLatestPrintSettings()
}, { deep: true })

const storePrintSettingsForSet = () => {
  if (set.value == null) {
    return
  }
  localStorage.setItem(`printSettings-${set.value.id}`, JSON.stringify(printSettings.value))
}

const storeLatestPrintSettings = () => {
  localStorage.setItem('printSettings-latest', JSON.stringify(printSettings.value))
}

const loadPrintSettings = () => {
  let storedPrintSettings = loadPrintSettingsForSet()
  if (storedPrintSettings == null) {
    storedPrintSettings = loadLatestPrintSettings()
  }
  if (storedPrintSettings == null) {
    return
  }
  try {
    printSettings.value = PrintSettings.parse(JSON.parse(storedPrintSettings))
  } catch (error) {
    console.error('Failed to load print settings:', error)
  }
}

const loadPrintSettingsForSet = () => {
  if (set.value == null) {
    return
  }
  return localStorage.getItem(`printSettings-${set.value.id}`)
}

const loadLatestPrintSettings = () => {
  return localStorage.getItem('printSettings-latest')
}
</script>
