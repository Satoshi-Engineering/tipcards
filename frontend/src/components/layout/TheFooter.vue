<template>
  <footer
    class="
      px-5 py-7 pb-5
      bg-bluegrey text-white
    "
  >
    <div>
      <LinkDefault
        no-bold
        invert-underline
        :to="{ name: 'about', params: { lang: $route.params.lang } }"
      >
        {{ $t('nav.about') }}
      </LinkDefault>
    </div>
    <div
      v-if="linkPrivacyPolicy != null || linkLegalNotice != null"
      class="flex flex-row mt-6"
    >
      <LinkDefault
        v-if="linkPrivacyPolicy != null"
        class="mr-8"
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
      class="flex flex-row mt-6"
    >
      <LinkDefault
        v-if="linkLinkedIn != null"
        class="mr-8"
        no-bold
        invert-underline
        :href="linkLinkedIn"
      >
        <IconLinkedIn />
      </LinkDefault>
      <LinkDefault
        v-if="linkX != null"
        class="mr-8"
        no-bold
        invert-underline
        :href="linkX"
      >
        <IconX />
      </LinkDefault>
      <LinkDefault
        v-if="linkInstagram != null"
        class="mr-8"
        no-bold
        invert-underline
        :href="linkInstagram"
      >
        <IconInstagram />
      </LinkDefault>
    </div>
    <div class="mt-5 text-right">
      <LinkDefault
        href="https://satoshiengineering.com"
        class="text-white-50"
        no-bold
        invert-underline
      >
        by Satoshi Engineering
      </LinkDefault>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { inject } from 'vue'

import LinkDefault from '@/components/typography/LinkDefault.vue'
import IconInstagram from '@/components/svgs/IconInstagram.vue'
import IconLinkedIn from '@/components/svgs/IconLinkedIn.vue'
import IconX from '@/components/svgs/IconX.vue'

const linkPrivacyPolicy = inject<string | undefined>('linkPrivacyPolicy')
const linkLegalNotice = inject<string | undefined>('linkLegalNotice')
const supportEmail = inject<string | undefined>('supportEmail')
const linkLinkedIn = inject<string | undefined>('linkLinkedIn')
const linkX = inject<string | undefined>('linkX')
const linkInstagram = inject<string | undefined>('linkInstagram')
</script>
