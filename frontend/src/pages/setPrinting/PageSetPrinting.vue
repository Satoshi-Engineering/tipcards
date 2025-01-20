<template>
  <TheLayout full-width>
    <CenterContainer full-width class="print:hidden">
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
    </CenterContainer>
    <CenterContainer full-width class="lg:flex justify-between gap-3">
      <aside class="print:hidden max-w-md min-w-56 flex-1 lg:max-w-sm">
        <div class="text-sm mb-5">
          All sizes in mm.
        </div>
        <div>
          <strong>Card</strong>
          <div class="flex gap-3">
            <TextField
              v-model="cardWidth"
              label="Width"
              type="number"
              min="0"
              :max="pageWidth - minPaddingHorizontal * 2"
              step="1"
              class="w-full"
            />
            <TextField
              v-model="cardHeight"
              label="Height"
              type="number"
              min="0"
              :max="pageHeight - minPaddingVertical * 2"
              step="1"
              class="w-full"
            />
          </div>
        </div>
        <div>
          <strong>Page</strong>
          <div class="flex gap-3">
            <TextField
              v-model="pageWidth"
              label="Width"
              type="number"
              min="0"
              step="1"
              class="w-full"
            />
            <TextField
              v-model="pageHeight"
              label="Height"
              type="number"
              min="0"
              step="1"
              class="w-full"
            />
          </div>
        </div>
        <div>
          <strong>Minimum print margins</strong>
          <div class="flex gap-3">
            <TextField
              v-model="minPaddingHorizontal"
              label="Horizontal"
              type="number"
              min="0"
              step="1"
              class="w-full"
            />
            <TextField
              v-model="minPaddingVertical"
              label="Vertical"
              type="number"
              min="0"
              step="1"
              class="w-full"
            />
          </div>
          <div>
            <strong>QR code</strong>
            <div class="flex gap-3">
              <TextField
                v-model="qrCodeSize"
                label="Size"
                type="number"
                min="0"
                step="1"
                class="w-full"
              />
              <TextField
                v-model="qrCodeX"
                label="X"
                type="number"
                min="0"
                step="1"
                class="w-full"
              />
              <TextField
                v-model="qrCodeY"
                label="Y"
                type="number"
                min="0"
                step="1"
                class="w-full"
              />
            </div>
          </div>
          <div>
            <strong>Images</strong>
            <div class="flex flex-col gap-3">
              <ImageDropZone
                v-model="frontSideImage"
                label="Drop front side image here"
              />
              <ImageDropZone
                v-model="backSideImage"
                label="Drop back side image here"
              />
            </div>
          </div>
          <div class="my-5">
            <strong>Print settings</strong>
            <label class="flex gap-3">
              <input v-model="printBorders" type="checkbox">
              Print borders
            </label>
            <label class="flex gap-3">
              <input v-model="printCropMarks" type="checkbox">
              Print crop marks
            </label>
            <label class="flex gap-3">
              <input v-model="printText" type="checkbox">
              Print text
            </label>
            <label class="flex gap-3">
              <input v-model="doubleSidedPrinting" type="checkbox">
              Double-sided printing
            </label>
          </div>
          <LinkDefault
            variant="secondary"
            type="button"
            @click="setDefaultValues"
          >
            Reset
          </LinkDefault>
        </div>
      </aside>
      <div class="overflow-x-auto px-3 -mx-3">
        <template
          v-for="(page, pageIndex) in pages"
          :key="pageIndex"
        >
          <PaperCssSheet
            :width="pageWidth"
            :height="pageHeight"
            class="flex flex-wrap content-start"
            :style="{ paddingBlock: `${paddingVertical}mm`, paddingInline: `${paddingHorizontal}mm` }"
          >
            <SetPrintingCard
              v-for="indexOnPage in Array.from({ length: cardsPerPage }).fill(0).map((_, i) => i)"
              :key="`page-${pageIndex}_card-${indexOnPage}`"
              :style="{ width: `${cardWidth}mm`, height: `${cardHeight}mm` }"
              :index-on-page="indexOnPage"
              :cards-per-row="cardsPerRow"
              :cards-per-page="cardsPerPage"
              :borders="printBorders"
              :crop-marks="printCropMarks"
              class="break-anywhere"
            >
              <template v-if="page[indexOnPage] != null" #default>
                <img
                  v-if="frontSideImage"
                  :src="frontSideImage"
                  class="absolute w-full h-full object-fit object-center"
                >
                <SetPrintingQrCode
                  class="absolute"
                  :style="{ width: `${qrCodeSize}mm`, height: `${qrCodeSize}mm`, top: `${qrCodeY}mm`, insetInlineStart: `${qrCodeX}mm` }"
                  :text="getLandingPageUrlWithLnurl(page[indexOnPage].hash, set?.settings.landingPage ?? undefined)"
                />
                <div
                  v-if="printText && set != null"
                  class="absolute top-0 bottom-0 mx-3 flex items-center"
                  :style="{ insetInlineStart: `${qrCodeX + qrCodeSize}mm` }"
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
            v-if="doubleSidedPrinting"
            :width="pageWidth"
            :height="pageHeight"
            class="flex flex-wrap flex-row-reverse content-start"
            :style="{ paddingBlock: `${paddingVertical}mm`, paddingInline: `${paddingHorizontal}mm` }"
          >
            <SetPrintingCard
              v-for="indexOnPage in Array.from({ length: cardsPerPage }).fill(0).map((_, i) => i)"
              :key="`page-${pageIndex}_card-${indexOnPage}`"
              :style="{ width: `${cardWidth}mm`, height: `${cardHeight}mm` }"
              :index-on-page="indexOnPage"
              :cards-per-row="cardsPerRow"
              :cards-per-page="cardsPerPage"
              :borders="false"
              :crop-marks="false"
              is-backside
              class="break-anywhere"
            >
              <template v-if="page[indexOnPage] != null" #default>
                <div class="w-full h-full grid place-items-center relative overflow-hidden">
                  <img
                    v-if="backSideImage"
                    :src="backSideImage"
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
import TextField from '@/components/forms/TextField.vue'
import SetPrintingQrCode from './components/SetPrintingQrCode.vue'
import ImageDropZone from './components/ImageDropZone.vue'
import sanitizeI18n from '@/modules/sanitizeI18n'
import ParagraphDefault from '@/components/typography/ParagraphDefault.vue'
import IconLogo from '@/components/icons/IconLogo.vue'
import LinkDefault from '@/components/typography/LinkDefault.vue'

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

watch(set, () => {
  if (set.value == null) {
    return
  }
  setDocumentTitle(displayName.value)
})

const doubleSidedPrinting = ref(false)

const pageWidth = ref(0)
const pageHeight = ref(0)

const minPaddingHorizontal = ref(0)
const minPaddingVertical = ref(0)

const cardWidth = ref(0)
const cardHeight = ref(0)

const qrCodeSize = ref(0)
const qrCodeX = ref(0)
const qrCodeY = ref(0)

const frontSideImage = ref<string>()
const backSideImage = ref<string>()

const printBorders = ref(false)
const printText = ref(true)
const printCropMarks = ref(true)

const setDefaultValues = () => {
  doubleSidedPrinting.value = false
  pageWidth.value = 211
  pageHeight.value = 297
  minPaddingHorizontal.value = 10
  minPaddingVertical.value = 10
  cardWidth.value = 85
  cardHeight.value = 55
  qrCodeSize.value = 39
  qrCodeX.value = 4
  qrCodeY.value = (cardHeight.value - qrCodeSize.value) / 2
  frontSideImage.value = undefined
  backSideImage.value = undefined
  printBorders.value = false
  printText.value = true
  printCropMarks.value = true
}

setDefaultValues()

const cardsPerRow = computed(() => Math.floor((pageWidth.value - 2 * minPaddingHorizontal.value) / cardWidth.value))
const cardsPerColumn = computed(() => Math.floor((pageHeight.value - 2 * minPaddingVertical.value) / cardHeight.value))

const paddingHorizontal = computed(() => (pageWidth.value - cardWidth.value * cardsPerRow.value) / 2)
const paddingVertical = computed(() => (pageHeight.value - cardHeight.value * cardsPerColumn.value) / 2)

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
</script>
