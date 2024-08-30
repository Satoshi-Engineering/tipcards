<template>
  <TheLayout>
    <CenterContainer class="mb-10">
      <BackLink :to="{ name: 'style-guide', params: { lang: $route.params.lang }}">
        Style Guide
      </BackLink>
      <HeadlineDefault level="h1" class="mt-0">
        Icons
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
        <IconArrowLeftRight class="w-10" :class="cssClass" />
        <IconArrowLeftRight class="w-10 text-yellow" :class="cssClass" />
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
        <IconShare class="w-10" :class="cssClass" />
        <IconShare class="w-10 text-yellow" :class="cssClass" />
        <IconTriangleExclamationMark class="w-10 h-10" :class="cssClass" />
        <IconTriangleExclamationMark class="w-10 h-10 text-yellow" :class="cssClass" />
      </div>

      <HeadlineDefault level="h2">
        Bootstrap Icons
      </HeadlineDefault>

      <div class="mb-8 flex flex-wrap items-center gap-5">
        <IconArrowLeftCircleFill class="w-10" :class="cssClass" />
        <IconArrowLeftCircleFill class="w-10 text-yellow" :class="cssClass" />
        <IconArrowRightCircleFill class="w-10" :class="cssClass" />
        <IconArrowRightCircleFill class="w-10 text-yellow" :class="cssClass" />
        <IconHouseDoorFill class="w-10" :class="cssClass" />
        <IconHouseDoorFill class="w-10 text-yellow" :class="cssClass" />
        <IconBookmarkFill class="w-10" :class="cssClass" />
        <IconBookmarkFill class="w-10 text-yellow" :class="cssClass" />
        <IconMicrosoft class="w-10" :class="cssClass" />
        <IconMicrosoft class="w-10 text-yellow" :class="cssClass" />
        <IconLightbulbFill class="w-10" :class="cssClass" />
        <IconLightbulbFill class="w-10 text-yellow" :class="cssClass" />
        <IconPersonCircle class="w-10" :class="cssClass" />
        <IconPersonCircle class="w-10 text-yellow" :class="cssClass" />
        <IconArrowDownUp class="w-10" :class="cssClass" />
        <IconArrowDownUp class="w-10 text-yellow" :class="cssClass" />
        <IconCheckSquareFill class="w-10" :class="cssClass" />
        <IconCheckSquareFill class="w-10 text-yellow" :class="cssClass" />
        <IconExclamationSquare class="w-10" :class="cssClass" />
        <IconExclamationSquare class="w-10 text-yellow" :class="cssClass" />
        <IconBarChartFill class="w-10" :class="cssClass" />
        <IconBarChartFill class="w-10 text-yellow" :class="cssClass" />
      </div>

      <HeadlineDefault level="h2">
        TipCards
      </HeadlineDefault>

      <div class="mb-8 flex flex-wrap items-center gap-5">
        <IconTipCardArrowUp class="w-10 h-10" :class="cssClass" />
        <IconTipCardArrowUp class="w-10 h-10 text-yellow" :class="cssClass" />
        <IconTipCardAvatar class="w-10 h-10" :class="cssClass" />
        <IconTipCardAvatar class="w-10 h-10 text-yellow" :class="cssClass" />
        <IconTipCardPencil class="w-10 h-10" :class="cssClass" />
        <IconTipCardPencil class="w-10 h-10 text-yellow" :class="cssClass" />
        <IconTipCardsPlus class="w-10 h-10" :class="cssClass" />
        <IconTipCardsPlus class="w-10 h-10 text-yellow" :class="cssClass" />
        <IconTipCardSet class="w-10 h-10" :class="cssClass" />
        <IconTipCardSet class="w-10 h-10 text-yellow" :class="cssClass" />
        <IconTipCardSetArrowUp class="w-10 h-10" :class="cssClass" />
        <IconTipCardSetArrowUp class="w-10 h-10 text-yellow" :class="cssClass" />
        <IconTipCardPlus class="w-10 h-10" :class="cssClass" />
        <IconTipCardPlus class="w-10 h-10 text-yellow" :class="cssClass" />
        <IconTipCardsQuestionmark class="w-10 h-10" :class="cssClass" />
        <IconTipCardsQuestionmark class="w-10 h-10 text-yellow" :class="cssClass" />
        <IconWalletArrowDown class="w-10 h-10" :class="cssClass" />
        <IconWalletArrowDown class="w-10 h-10 text-yellow" :class="cssClass" />
        <IconMobilePhoneQuestionmark class="w-10 h-10" :class="cssClass" />
        <IconMobilePhoneQuestionmark class="w-10 h-10 text-yellow" :class="cssClass" />
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
        <IconLogoWalletOfSatoshi class="w-52" :class="cssClass" />
        <IconLogoBlinkWallet class="w-28" :class="cssClass" />
        <IconLogoCoinos class="w-28" :class="cssClass" />
        <IconLogoBreez class="w-28 text-[#0085FB]" :class="cssClass" />
        <IconLogoPhoenix class="h-10" :class="cssClass" />
        <IconLogoAprycotMedia class="w-28" :class="cssClass" />
        <IconLogoLightningNetworkStores class="w-28" :class="cssClass" />
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
import IconTipCardAvatar from '@/components/icons/IconTipCardAvatar.vue'
import IconTipCardsPlus from '@/components/icons/IconTipCardsPlus.vue'
import IconTipCardSetArrowUp from '@/components/icons/IconTipCardSetArrowUp.vue'
import IconTipCardPencil from '@/components/icons/IconTipCardPencil.vue'
import IconTipCardPlus from '@/components/icons/IconTipCardPlus.vue'
import IconTipCardsQuestionmark from '@/components/icons/IconTipCardsQuestionmark.vue'
import IconTriangleExclamationMark from '@/components/icons/IconTriangleExclamationMark.vue'
import IconWorld from '@/components/icons/IconWorld.vue'
import IconAnimatedCheckmark from '@/components/icons/IconAnimatedCheckmark.vue'
import IconAnimatedLoadingWheel from '@/components/icons/IconAnimatedLoadingWheel.vue'
import IconLogoInstagram from '@/components/icons/IconLogoInstagram.vue'
import IconLogoLinkedIn from '@/components/icons/IconLogoLinkedIn.vue'
import ButtonDefault from '@/components/buttons/ButtonDefault.vue'
import IconArrowLeftCircleFill from '@/components/icons/IconArrowLeftCircleFill.vue'
import IconArrowRightCircleFill from '@/components/icons/IconArrowRightCircleFill.vue'
import IconHouseDoorFill from '@/components/icons/IconHouseDoorFill.vue'
import IconBookmarkFill from '@/components/icons/IconBookmarkFill.vue'
import IconMicrosoft from '@/components/icons/IconMicrosoft.vue'
import IconLightbulbFill from '@/components/icons/IconLightbulbFill.vue'
import IconPersonCircle from '@/components/icons/IconPersonCircle.vue'
import IconArrowDownUp from '@/components/icons/IconArrowDownUp.vue'
import IconCheckSquareFill from '@/components/icons/IconCheckSquareFill.vue'
import IconExclamationSquare from '@/components/icons/IconExclamationSquare.vue'
import IconTipCardArrowUp from '@/components/icons/IconTipCardArrowUp.vue'
import IconTipCardSet from '@/components/icons/IconTipCardSet.vue'
import IconShare from '@/components/icons/IconShare.vue'
import IconArrowLeftRight from '@/components/icons/IconArrowLeftRight.vue'
import IconBarChartFill from '@/components/icons/IconBarChartFill.vue'
import BackLink from '@/components/BackLink.vue'
import IconWalletArrowDown from '@/components/icons/IconWalletArrowDown.vue'
import IconLogoWalletOfSatoshi from '@/components/icons/IconLogoWalletOfSatoshi.vue'
import IconLogoBlinkWallet from '@/components/icons/IconLogoBlinkWallet.vue'
import IconLogoCoinos from '@/components/icons/IconLogoCoinos.vue'
import IconLogoBreez from '@/components/icons/IconLogoBreez.vue'
import IconLogoPhoenix from '@/components/icons/IconLogoPhoenix.vue'
import IconLogoAprycotMedia from '@/components/icons/IconLogoAprycotMedia.vue'
import IconLogoLightningNetworkStores from '@/components/icons/IconLogoLightningNetworkStores.vue'
import IconMobilePhoneQuestionmark from '@/components/icons/IconMobilePhoneQuestionmark.vue'

const addBackgroundToIcons = ref(false)

const cssClass = computed(() => {
  return addBackgroundToIcons.value ? 'bg-grey-medium' : ''
})
</script>
