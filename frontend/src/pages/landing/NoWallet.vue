<template>
  <CenterContainer
    id="no-wallet"
    class="relative mb-14 flex flex-col items-center"
  >
    <IconWalletArrowDown class="w-10 h-10 text-yellow" />
    <HeadlineDefault level="h2">
      {{ $t('landing.sectionNoWallet.headline') }}
    </HeadlineDefault>
    <ParagraphDefault class="mt-0 mb-4 text-center">
      {{ $t('landing.sectionNoWallet.explanation') }}
    </ParagraphDefault>
    <div class="w-[280px] grid gap-2 grid-cols-2">
      <ButtonIconCard
        class="h-[100px] col-span-2"
        icon-class="p-8"
        href="https://walletofsatoshi.com/"
      >
        <IconLogoWalletOfSatoshi />
      </ButtonIconCard>
      <ButtonIconCard
        class="h-[70px]"
        href="https://coinos.io/"
      >
        <IconLogoCoinos class="h-[26px]" />
      </ButtonIconCard>
      <ButtonIconCard
        class="h-[70px]"
        href="https://blink.sv/"
      >
        <IconLogoBlinkWallet class="h-[20px] text-[#fb5607]" />
      </ButtonIconCard>
      <ButtonIconCard
        class="h-[50px]"
        href="https://breez.technology/mobile/"
      >
        <IconLogoBreez class="h-[20px] text-[#0085FB]" />
      </ButtonIconCard>
      <ButtonIconCard
        class="h-[50px]"
        href="https://phoenix.acinq.co/"
      >
        <IconLogoPhoenix class="h-10" />
      </ButtonIconCard>
    </div>
  </CenterContainer>
</template>

<script setup lang="ts">
import ButtonIconCard from '@/components/buttons/ButtonIconCard.vue'
import IconLogoBlinkWallet from '@/components/icons/IconLogoBlinkWallet.vue'
import IconLogoBreez from '@/components/icons/IconLogoBreez.vue'
import IconLogoCoinos from '@/components/icons/IconLogoCoinos.vue'
import IconLogoPhoenix from '@/components/icons/IconLogoPhoenix.vue'
import IconLogoWalletOfSatoshi from '@/components/icons/IconLogoWalletOfSatoshi.vue'
import IconWalletArrowDown from '@/components/icons/IconWalletArrowDown.vue'
import CenterContainer from '@/components/layout/CenterContainer.vue'
import HeadlineDefault from '@/components/typography/HeadlineDefault.vue'
import ParagraphDefault from '@/components/typography/ParagraphDefault.vue'
</script>
