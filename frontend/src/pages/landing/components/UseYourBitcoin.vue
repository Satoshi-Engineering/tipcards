<template>
  <CenterContainer
    class="relative"
    data-test="use-your-bitcoin"
  >
    <IconMobilePhoneQuestionmark class="mx-auto w-10 h-10 text-yellow" />
    <HeadlineDefault level="h2" class="text-center">
      {{ $t('landing.sectionUse.headline') }}
    </HeadlineDefault>
    <ParagraphDefault class="text-center">
      {{ $t('landing.sectionUse.message') }}
    </ParagraphDefault>
    <ParagraphDefault class="mt-10 mb-5">
      {{ $t('landing.sectionUse.examplesIntro') }}
    </ParagraphDefault>
    <ul class="flex flex-col gap-4">
      <li>
        <ButtonIconCard
          icon-class="w-[70px] h-[50px] flex-none p-1"
          href="https://satoshistore.io/"
        >
          <template #default>
            <img
              :src="logoSatoshiStore"
              :srcset="`${logoSatoshiStore} 1x, ${logoSatoshiStore2x} 2x`"
              alt="satoshiStore.io"
            >
          </template>
          <template #description>
            <HeadlineDefault level="h4" class="!mt-1 !mb-0">
              satoshistore.io
            </HeadlineDefault>
            <ParagraphDefault class="!m-0 text-sm">
              {{ $t('landing.sectionUse.examples.satoshistore') }}
            </ParagraphDefault>
          </template>
        </ButtonIconCard>
      </li>
      <li>
        <ButtonIconCard
          icon-class="w-[70px] h-[50px] flex-none"
          href="https://aprycot.media/"
        >
          <template #default>
            <IconLogoAprycotMedia />
          </template>
          <template #description>
            <HeadlineDefault level="h4" class="!mt-1 !mb-0">
              aprycot.media
            </HeadlineDefault>
            <ParagraphDefault class="!m-0 text-sm">
              {{ $t('landing.sectionUse.examples.aprycotMedia') }}
            </ParagraphDefault>
          </template>
        </ButtonIconCard>
      </li>
      <li>
        <ButtonIconCard
          icon-class="w-[70px] h-[50px] flex-none p-1"
          href="https://copiaro.de/"
        >
          <template #default>
            <img
              :src="logoCopiaro"
              alt="copiaro.de"
            >
          </template>
          <template #description>
            <HeadlineDefault level="h4" class="!mt-1 !mb-0">
              copiaro.de
            </HeadlineDefault>
            <ParagraphDefault class="!m-0 text-sm">
              {{ $t('landing.sectionUse.examples.copiaro') }}
            </ParagraphDefault>
          </template>
        </ButtonIconCard>
      </li>
      <li>
        <ButtonIconCard
          icon-class="w-[70px] h-[50px] flex-none p-1"
          href="https://lightningnetworkstores.com/"
        >
          <template #default>
            <IconLogoLightningNetworkStores />
          </template>
          <template #description>
            <HeadlineDefault level="h4" class="!mt-1 !mb-0">
              lightningnetworkstores.com
            </HeadlineDefault>
            <ParagraphDefault class="!m-0 text-sm">
              {{ $t('landing.sectionUse.examples.lightningnetworkstores') }}
            </ParagraphDefault>
          </template>
        </ButtonIconCard>
      </li>
      <li>
        <ButtonIconCard
          icon-class="w-[70px] h-[50px] flex-none p-1"
          href="https://coinpages.io/"
        >
          <template #default>
            <img
              :src="logoCoinPages"
              alt="coinpages.io"
            >
          </template>
          <template #description>
            <HeadlineDefault level="h4" class="!mt-1 !mb-0">
              coinpages.io
            </HeadlineDefault>
            <ParagraphDefault class="!m-0 text-sm">
              {{ $t('landing.sectionUse.examples.coinpages') }}
            </ParagraphDefault>
          </template>
        </ButtonIconCard>
      </li>
    </ul>
  </CenterContainer>
</template>

<script setup lang="ts">
import logoCopiaro from '@/assets/images/logo_copiaro.png'
import logoCoinPages from '@/assets/images/logo_coin-pages.png'
import logoSatoshiStore from '@/assets/images/logo_satoshistoreio_300x.png'
import logoSatoshiStore2x from '@/assets/images/logo_satoshistoreio_300x@2x.png'
import ButtonIconCard from '@/components/buttons/ButtonIconCard.vue'
import IconLogoAprycotMedia from '@/components/icons/IconLogoAprycotMedia.vue'
import IconLogoLightningNetworkStores from '@/components/icons/IconLogoLightningNetworkStores.vue'
import IconMobilePhoneQuestionmark from '@/components/icons/IconMobilePhoneQuestionmark.vue'
import CenterContainer from '@/components/layout/CenterContainer.vue'
import HeadlineDefault from '@/components/typography/HeadlineDefault.vue'
import ParagraphDefault from '@/components/typography/ParagraphDefault.vue'
</script>
