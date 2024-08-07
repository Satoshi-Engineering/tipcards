<template>
  <TheLayout>
    <CenterContainer class="mb-10">
      <HeadlineDefault level="h1">
        Lightning TipCards Style Guide Icons
      </HeadlineDefault>

      <HeadlineDefault level="h2">
        Base Icons
      </HeadlineDefault>

      <div class="mb-8 flex flex-wrap items-center gap-5">
        <IconArrowRight class="w-10 bg-grey-medium" />
        <IconArrowRight class="w-10 bg-grey-medium text-yellow" />
        <IconCaretDown class="w-10 bg-grey-medium" />
        <IconCaretDown class="w-10 bg-grey-medium text-yellow" />
        <IconCaretLeft class="w-10 bg-grey-medium" />
        <IconCaretLeft class="w-10 bg-grey-medium text-yellow" />
        <IconCaretRight class="w-10 bg-grey-medium" />
        <IconCaretRight class="w-10 bg-grey-medium text-yellow" />
        <IconCaretUp class="w-10 bg-grey-medium" />
        <IconCaretUp class="w-10 bg-grey-medium text-yellow" />
        <IconLightningBolt class="w-10 h-10 bg-grey-medium" />
        <IconLightningBolt class="w-10 h-10 bg-grey-medium text-yellow" />
        <IconMainNav class="!w-8 !h-6 bg-grey-medium" />
        <IconMainNav class="!w-8 !h-6 bg-grey-medium text-yellow" />
        <IconPlay class="w-10 bg-grey-medium" />
        <IconPlay class="w-10 bg-grey-medium text-yellow" />
        <IconPlus class="w-10 bg-grey-medium" />
        <IconPlus class="w-10 bg-grey-medium text-yellow" />
        <IconPrinter class="w-10 bg-grey-medium" />
        <IconPrinter class="w-10 bg-grey-medium text-yellow" />
        <IconQuestionmark class="w-10 h-10 bg-grey-medium" />
        <IconQuestionmark class="w-10 h-10 bg-grey-medium text-yellow" />
        <IconRectangleAvatar class="w-10 h-10 bg-grey-medium" />
        <IconRectangleAvatar class="w-10 h-10 bg-grey-medium text-yellow" />
        <IconRectanglePlus class="w-10 h-10 bg-grey-medium" />
        <IconRectanglePlus class="w-10 h-10 bg-grey-medium text-yellow" />
        <IconRectanglesArrowUp class="w-10 h-10 bg-grey-medium" />
        <IconRectanglesArrowUp class="w-10 h-10 bg-grey-medium text-yellow" />
        <IconRectanglesPencil class="w-10 h-10 bg-grey-medium" />
        <IconRectanglesPencil class="w-10 h-10 bg-grey-medium text-yellow" />
        <IconRectanglesPlus class="w-10 h-10 bg-grey-medium" />
        <IconRectanglesPlus class="w-10 h-10 bg-grey-medium text-yellow" />
        <IconRectanglesQuestionmark class="w-10 h-10 bg-grey-medium" />
        <IconRectanglesQuestionmark class="w-10 h-10 bg-grey-medium text-yellow" />
        <IconTriangleExclamationMark class="w-10 h-10 bg-grey-medium" />
        <IconTriangleExclamationMark class="w-10 h-10 bg-grey-medium text-yellow" />
        <IconWorld class="w-10 bg-grey-medium" />
        <IconWorld class="w-10 bg-grey-medium text-yellow" />
        <IconX class="w-10 bg-grey-medium" />
        <IconX class="w-10 bg-grey-medium text-yellow" />
      </div>

      <HeadlineDefault level="h2">
        Logos
      </HeadlineDefault>

      <div class="mb-8 flex flex-wrap items-center gap-5">
        <IconLogo class="h-10 w-auto bg-grey-medium" />
        <IconBitcoin class="w-10 bg-grey-medium" />
        <IconLogoInstagram class="w-10 bg-grey-medium" />
        <IconLogoInstagram class="w-10 bg-grey-medium text-yellow" />
        <IconLogoLightning class="w-10 bg-grey-medium" />
        <IconLogoLinkedIn class="w-10 bg-grey-medium" />
        <IconLogoLinkedIn class="w-10 bg-grey-medium text-yellow" />
        <IconLogoX class="w-10 bg-grey-medium" />
        <IconLogoX class="w-10 bg-grey-medium text-yellow" />
      </div>

      <HeadlineDefault level="h2">
        Animated Icons
      </HeadlineDefault>

      <div class="flex flex-wrap items-center gap-5">
        <IconAnimatedCheckmark class="w-10 bg-grey-medium" />
        <IconAnimatedCheckmark class="w-10 bg-grey-medium text-yellow" />
        <IconAnimatedCheckmark class="w-10 bg-grey-medium text-[#22AE73]" />
        <IconAnimatedLoadingWheel class="w-10 bg-grey-medium" />
        <IconAnimatedLoadingWheel class="w-10 bg-grey-medium text-yellow" />
      </div>
    </CenterContainer>
  </TheLayout>
</template>

<script setup lang="ts">
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
</script>
