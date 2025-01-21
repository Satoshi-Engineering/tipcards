<template>
  <TheLayout full-width>
    <CenterContainer full-width class="print:hidden">
      <BackLink :to="{ name: 'set', params: { setId, lang: $route.params.lang } }" />
    </CenterContainer>
    <CenterContainer
      v-if="!isLoggedIn || loading || set == null || userErrorMessages.length > 0"
      full-width
      class="print:hidden flex flex-col items-center"
    >
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
    </CenterContainer>
    <CenterContainer
      v-else
      full-width
      class="lg:flex justify-between gap-3"
    >
      <aside class="print:hidden min-w-56 flex-1 lg:max-w-sm">
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
      <div class="overflow-x-auto px-5 py-3 -mx-5 my-3 lg:-my-3 print:overflow-x-visible print:!p-0 print:!m-0">
        <template
          v-for="(page, pageIndex) in pages"
          :key="pageIndex"
        >
          <PaperCssSheet
            v-if="!printSettings.backSidesOnly"
            :width="printSettings.pageWidth"
            :height="printSettings.pageHeight"
            :padding-horizontal="paddingHorizontal"
            :padding-vertical="paddingVertical"
            class="flex flex-wrap content-start"
            :style="{ rowGap: `${printSettings.cardGapVertical}mm`, columnGap: `${printSettings.cardGapHorizontal}mm` }"
          >
            <SetInfoHeader
              v-if="printSettings.printSetInfo"
              :set-id="setId"
              :page-index="pageIndex"
              :total-pages="pages.length"
              :padding-horizontal="paddingHorizontal"
            />
            <template
              v-for="indexOnPage in Array.from({ length: cardsPerPage }).fill(0).map((_, i) => i)"
              :key="`page-${pageIndex}_card-${indexOnPage}`"
            >
              <CardFront
                v-if="page[indexOnPage] != null"
                :width="printSettings.cardWidth"
                :height="printSettings.cardHeight"

                :borders="printSettings.printBorders"
                :crop-marks="printSettings.printCropMarks"
                :index-on-page="indexOnPage"
                :cards-per-row="cardsPerRow"
                :cards-per-page="cardsPerPage"
                :card-gap-horizontal="printSettings.cardGapHorizontal"
                :card-gap-vertical="printSettings.cardGapVertical"

                :qr-code-size="printSettings.qrCodeSize"
                :qr-code-x="printSettings.qrCodeX"
                :qr-code-y="printSettings.qrCodeY"
                :show-text="printSettings.printText"
                :front-side-image="printSettings.frontSideImage"

                :landing-page-url="getLandingPageUrlWithLnurl(page[indexOnPage].hash, set?.settings.landingPage ?? undefined)"
                :headline="set?.settings.cardHeadline"
                :copytext="set?.settings.cardCopytext"
                :selected-card-logo="getSelectedCardLogo(set?.settings.image)"
              />
              <SetPrintingCard
                v-else
                :width="printSettings.cardWidth"
                :height="printSettings.cardHeight"
                :index-on-page="indexOnPage"
                :cards-per-row="cardsPerRow"
                :cards-per-page="cardsPerPage"
                :card-gap-horizontal="printSettings.cardGapHorizontal"
                :card-gap-vertical="printSettings.cardGapVertical"
                :borders="false"
                :crop-marks="printSettings.printCropMarks"
              />
            </template>
          </PaperCssSheet>

          <PaperCssSheet
            v-if="printSettings.doubleSidedPrinting || printSettings.backSidesOnly"
            :width="printSettings.pageWidth"
            :height="printSettings.pageHeight"
            :padding-horizontal="paddingHorizontal"
            :padding-vertical="paddingVertical"
            class="flex flex-wrap flex-row-reverse content-start"
            :style="{ rowGap: `${printSettings.cardGapVertical}mm`, columnGap: `${printSettings.cardGapHorizontal}mm` }"
          >
            <SetInfoHeader
              v-if="printSettings.printSetInfo"
              is-back-side
              :set-id="setId"
              :page-index="pageIndex"
              :total-pages="pages.length"
              :padding-horizontal="paddingHorizontal"
            />
            <template
              v-for="indexOnPage in Array.from({ length: cardsPerPage }).fill(0).map((_, i) => i)"
              :key="`page-${pageIndex}_card-${indexOnPage}`"
            >
              <CardBack
                v-if="page[indexOnPage] != null"
                :width="printSettings.cardWidth"
                :height="printSettings.cardHeight"

                :borders="printSettings.backSidesOnly && printSettings.printBorders"
                :crop-marks="printSettings.backSidesOnly && printSettings.printCropMarks"
                :index-on-page="indexOnPage"
                :cards-per-row="cardsPerRow"
                :cards-per-page="cardsPerPage"
                :card-gap-horizontal="printSettings.cardGapHorizontal"
                :card-gap-vertical="printSettings.cardGapVertical"

                :back-side-image="printSettings.backSideImage"
              />
              <SetPrintingCard
                v-else
                :width="printSettings.cardWidth"
                :height="printSettings.cardHeight"
                :index-on-page="indexOnPage"
                :cards-per-row="cardsPerRow"
                :cards-per-page="cardsPerPage"
                :card-gap-horizontal="printSettings.cardGapHorizontal"
                :card-gap-vertical="printSettings.cardGapVertical"
                :borders="false"
                :crop-marks="printSettings.backSidesOnly && printSettings.printCropMarks"
                is-backside
              />
            </template>
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
import PaperCssSheet from './components/PaperCssSheet.vue'
import type { CardStatusDto } from '@shared/data/trpc/CardStatusDto'
import SetPrintingCard from './components/SetPrintingCard.vue'
import ParagraphDefault from '@/components/typography/ParagraphDefault.vue'
import SetPrintingConfigForm from './components/SetPrintingConfigForm.vue'
import ButtonDefault from '@/components/buttons/ButtonDefault.vue'
import ButtonContainer from '@/components/buttons/ButtonContainer.vue'
import useCardLogos from '@/modules/useCardLogos'
import CardFront from './components/CardFront.vue'
import CardBack from './components/CardBack.vue'
import SetInfoHeader from './components/SetInfoHeader.vue'
import useLandingPages from '@/modules/useLandingPages'

const props = defineProps({
  setId: {
    type: String,
    required: true,
  },
})

const { isLoggedIn } = storeToRefs(useAuthStore())
const { setDocumentTitle } = useSeoHelpers()
const { set, loading, userErrorMessages, displayName, cardStatuses } = useSet(props.setId)
const { getSelectedCardLogo } = useCardLogos()
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
const cardsPerPage = computed(() => cardsPerRow.value * cardsPerColumn.value)

const paddingHorizontal = computed(() => (printSettings.value.pageWidth - effectiveCardWidth.value * cardsPerRow.value + printSettings.value.cardGapHorizontal) / 2)
const paddingVertical = computed(() => (printSettings.value.pageHeight - effectiveCardHeight.value * cardsPerColumn.value + printSettings.value.cardGapVertical) / 2)

const pages = computed<CardStatusDto[][]>(() => splitCardsIntoPages(cardStatuses.value, cardsPerPage.value))

const splitCardsIntoPages = (cards: CardStatusDto[], cardsPerPage: number): CardStatusDto[][] =>
  cards.reduce<CardStatusDto[][]>((pages, card) => {
    const lastPage = pages[pages.length - 1]

    if (lastPage == null || lastPage.length === cardsPerPage) {
      pages.push([card])
    } else {
      lastPage.push(card)
    }

    return pages
  }, [[]])

const printPage = () => {
  window.print()
}

watch(printSettings, () => {
  if (set.value == null) {
    return
  }
  storePrintSettingsForSet()
}, { deep: true })

const storePrintSettingsForSet = () => {
  if (set.value == null) {
    return
  }
  localStorage.setItem(`printSettings-${set.value.id}`, JSON.stringify(printSettings.value))
}

const loadPrintSettings = () => {
  if (set.value == null) {
    return
  }
  const storedPrintSettings = localStorage.getItem(`printSettings-${set.value.id}`)
  if (storedPrintSettings == null) {
    return
  }
  try {
    printSettings.value = PrintSettings.parse(JSON.parse(storedPrintSettings))
  } catch (error) {
    console.error('Failed to load print settings:', error)
  }
}
</script>
