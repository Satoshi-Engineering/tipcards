<template>
  <footer class="bg-bluegrey text-white">
    <CenterContainer class="pt-7 pb-5">
      <div class="flex gap-8 mt-6">
        <LinkDefault
          no-bold
          invert-underline
          :to="{ name: 'about', params: { lang: $route.params.lang } }"
        >
          {{ $t('nav.about') }}
        </LinkDefault>
        <LinkDefault
          no-bold
          invert-underline
          :to="{ name: 'landing', params: { lang: $route.params.lang } }"
        >
          {{ $t('nav.landing') }}
        </LinkDefault>
      </div>
      <div
        v-if="linkPrivacyPolicy != null || linkLegalNotice != null"
        class="flex gap-8 mt-6"
      >
        <LinkDefault
          v-if="linkPrivacyPolicy != null"
          no-bold
          invert-underline
          :href="linkPrivacyPolicy"
        >
          {{ $t('nav.privacyPolicy') }}
        </LinkDefault>
        <LinkDefault
          v-if="linkLegalNotice != null"
          no-bold
          invert-underline
          :href="linkLegalNotice"
        >
          {{ $t('nav.legalNotice') }}
        </LinkDefault>
      </div>
      <div
        v-if="supportEmail != null"
        class="mt-6"
      >
        <LinkDefault
          no-bold
          invert-underline
          :href="`mailto:${supportEmail}?subject=Lightning%20Tip%20Cards%20Feedback`"
        >
          {{ supportEmail }}
        </LinkDefault>
      </div>
      <div
        v-if="linkLinkedIn != null || linkX != null || linkInstagram != null"
        class="grid grid-cols-[repeat(2,auto)_1fr] gap-x-8 mt-6"
      >
        <LinkDefault
          v-if="linkLinkedIn != null"
          no-bold
          invert-underline
          :href="linkLinkedIn"
        >
          <IconLogoLinkedIn class="w-8 text-white" />
        </LinkDefault>
        <LinkDefault
          v-if="linkX != null"
          no-bold
          invert-underline
          :href="linkX"
        >
          <IconLogoX class="w-8 text-white" />
        </LinkDefault>
        <LinkDefault
          v-if="linkInstagram != null"
          no-bold
          invert-underline
          :href="linkInstagram"
        >
          <IconLogoInstagram class="w-8 text-white" />
        </LinkDefault>
      </div>
      <div class="mt-5 text-end">
        <LinkDefault
          href="https://satoshiengineering.com"
          class="text-white-50 text-sm"
          no-bold
          invert-underline
        >
          by Satoshi Engineering
        </LinkDefault>
      </div>
    </CenterContainer>
  </footer>
</template>

<script setup lang="ts">
import { inject } from 'vue'

import CenterContainer from '@/components/layout/CenterContainer.vue'
import LinkDefault from '@/components/typography/LinkDefault.vue'
import IconLogoInstagram from '@/components/icons/IconLogoInstagram.vue'
import IconLogoLinkedIn from '@/components/icons/IconLogoLinkedIn.vue'
import IconLogoX from '@/components/icons/IconLogoX.vue'

const linkPrivacyPolicy = inject<string | undefined>('linkPrivacyPolicy')
const linkLegalNotice = inject<string | undefined>('linkLegalNotice')
const supportEmail = inject<string | undefined>('supportEmail')
const linkLinkedIn = inject<string | undefined>('linkLinkedIn')
const linkX = inject<string | undefined>('linkX')
const linkInstagram = inject<string | undefined>('linkInstagram')
</script>
