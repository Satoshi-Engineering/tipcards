<template>
  <TheLayout>
    <CenterContainer class="mb-10">
      <HeadlineDefault level="h1">
        Lightning TipCards Style Guide Icons
      </HeadlineDefault>

      <ButtonDefault
        class="mb-4"
        @click="addBackgroundToIcons = !addBackgroundToIcons"
      >
        Toggle Background
      </ButtonDefault>

      <HeadlineDefault level="h2">
        Base Icons
      </HeadlineDefault>

      <div class="mb-8 flex flex-wrap items-center gap-5">
        <IconArrowRight class="w-10" :class="cssClass" />
        <IconArrowRight class="w-10 text-yellow" :class="cssClass" />
        <IconCaretDown class="w-10" :class="cssClass" />
        <IconCaretDown class="w-10 text-yellow" :class="cssClass" />
        <IconCaretLeft class="w-10" :class="cssClass" />
        <IconCaretLeft class="w-10 text-yellow" :class="cssClass" />
        <IconCaretRight class="w-10" :class="cssClass" />
        <IconCaretRight class="w-10 text-yellow" :class="cssClass" />
        <IconCaretUp class="w-10" :class="cssClass" />
        <IconCaretUp class="w-10 text-yellow" :class="cssClass" />
        <IconLightningBolt class="w-10 h-10" :class="cssClass" />
        <IconLightningBolt class="w-10 h-10 text-yellow" :class="cssClass" />
        <IconMainNav class="!w-8 !h-6" :class="cssClass" />
        <IconMainNav class="!w-8 !h-6 text-yellow" :class="cssClass" />
        <IconPlay class="w-10" :class="cssClass" />
        <IconPlay class="w-10 text-yellow" :class="cssClass" />
        <IconPlus class="w-10" :class="cssClass" />
        <IconPlus class="w-10 text-yellow" :class="cssClass" />
        <IconPrinter class="w-10" :class="cssClass" />
        <IconPrinter class="w-10 text-yellow" :class="cssClass" />
        <IconQuestionmark class="w-10 h-10" :class="cssClass" />
        <IconQuestionmark class="w-10 h-10 text-yellow" :class="cssClass" />
        <IconWorld class="w-10" :class="cssClass" />
        <IconWorld class="w-10 text-yellow" :class="cssClass" />
        <IconX class="w-10" :class="cssClass" />
        <IconX class="w-10 text-yellow" :class="cssClass" />
      </div>

      <HeadlineDefault level="h2">
        Rectangle Icons
      </HeadlineDefault>

      <div class="mb-8 flex flex-wrap items-center gap-5">
        <IconRectangleAvatar class="w-10 h-10" :class="cssClass" />
        <IconRectangleAvatar class="w-10 h-10 text-yellow" :class="cssClass" />
        <IconRectanglePlus class="w-10 h-10" :class="cssClass" />
        <IconRectanglePlus class="w-10 h-10 text-yellow" :class="cssClass" />
        <IconRectanglesArrowUp class="w-10 h-10" :class="cssClass" />
        <IconRectanglesArrowUp class="w-10 h-10 text-yellow" :class="cssClass" />
        <IconRectanglesPencil class="w-10 h-10" :class="cssClass" />
        <IconRectanglesPencil class="w-10 h-10 text-yellow" :class="cssClass" />
        <IconRectanglesPlus class="w-10 h-10" :class="cssClass" />
        <IconRectanglesPlus class="w-10 h-10 text-yellow" :class="cssClass" />
        <IconRectanglesQuestionmark class="w-10 h-10" :class="cssClass" />
        <IconRectanglesQuestionmark class="w-10 h-10 text-yellow" :class="cssClass" />
        <IconTriangleExclamationMark class="w-10 h-10" :class="cssClass" />
        <IconTriangleExclamationMark class="w-10 h-10 text-yellow" :class="cssClass" />
      </div>

      <HeadlineDefault level="h2">
        Logos
      </HeadlineDefault>

      <div class="mb-8 flex flex-wrap items-center gap-5">
        <IconLogo class="h-10 w-auto" :class="cssClass" />
        <IconBitcoin class="w-10" :class="cssClass" />
        <IconLogoInstagram class="w-10" :class="cssClass" />
        <IconLogoInstagram class="w-10 text-yellow" :class="cssClass" />
        <IconLogoLightning class="w-10" :class="cssClass" />
        <IconLogoLinkedIn class="w-10" :class="cssClass" />
        <IconLogoLinkedIn class="w-10 text-yellow" :class="cssClass" />
        <IconLogoX class="w-10" :class="cssClass" />
        <IconLogoX class="w-10 text-yellow" :class="cssClass" />
      </div>

      <HeadlineDefault level="h2">
        Animated Icons
      </HeadlineDefault>

      <div class="flex flex-wrap items-center gap-5">
        <IconAnimatedCheckmark class="w-10" :class="cssClass" />
        <IconAnimatedCheckmark class="w-10 text-yellow" :class="cssClass" />
        <IconAnimatedCheckmark class="w-10 text-[#22AE73]" :class="cssClass" />
        <IconAnimatedLoadingWheel class="w-10" :class="cssClass" />
        <IconAnimatedLoadingWheel class="w-10 text-yellow" :class="cssClass" />
      </div>
    </CenterContainer>
  </TheLayout>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

import IconArrowRight from '@/components/icons/IconArrowRight.vue'
import IconBitcoin from '@/components/icons/IconLogoBitcoin.vue'
import IconCaretDown from '@/components/icons/IconCaretDown.vue'
import IconCaretLeft from '@/components/icons/IconCaretLeft.vue'
import IconCaretRight from '@/components/icons/IconCaretRight.vue'
import IconCaretUp from '@/components/icons/IconCaretUp.vue'
import IconX from '@/components/icons/IconX.vue'
import IconLogo from '@/components/icons/IconLogo.vue'
import IconLogoX from '@/components/icons/IconLogoX.vue'
import CenterContainer from '@/components/layout/CenterContainer.vue'
import TheLayout from '@/components/layout/TheLayout.vue'
import HeadlineDefault from '@/components/typography/HeadlineDefault.vue'
import IconLogoLightning from '@/components/icons/IconLogoLightning.vue'
import IconMainNav from '@/components/icons/IconMainNav.vue'
import IconPlay from '@/components/icons/IconPlay.vue'
import IconLightningBolt from '@/components/icons/IconLightningBolt.vue'
import IconPlus from '@/components/icons/IconPlus.vue'
import IconPrinter from '@/components/icons/IconPrinter.vue'
import IconQuestionmark from '@/components/icons/IconQuestionmark.vue'
import IconRectangleAvatar from '@/components/icons/IconRectangleAvatar.vue'
import IconRectanglePlus from '@/components/icons/IconRectanglePlus.vue'
import IconRectanglesArrowUp from '@/components/icons/IconRectanglesArrowUp.vue'
import IconRectanglesPencil from '@/components/icons/IconRectanglePencil.vue'
import IconRectanglesPlus from '@/components/icons/IconRectanglesPlus.vue'
import IconRectanglesQuestionmark from '@/components/icons/IconRectanglesQuestionmark.vue'
import IconTriangleExclamationMark from '@/components/icons/IconTriangleExclamationMark.vue'
import IconWorld from '@/components/icons/IconWorld.vue'
import IconAnimatedCheckmark from '@/components/icons/IconAnimatedCheckmark.vue'
import IconAnimatedLoadingWheel from '@/components/icons/IconAnimatedLoadingWheel.vue'
import IconLogoInstagram from '@/components/icons/IconLogoInstagram.vue'
import IconLogoLinkedIn from '@/components/icons/IconLogoLinkedIn.vue'
import ButtonDefault from '@/components/buttons/ButtonDefault.vue'

const addBackgroundToIcons = ref(false)

const cssClass = computed(() => {
  return addBackgroundToIcons.value ? 'bg-grey-medium' : ''
})
</script>
