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
        class="mr-8"
        no-bold
        invert-underline
        :href="linkPrivacyPolicy"
      >
        {{ $t('nav.privacyPolicy') }}
      </LinkDefault>
      <LinkDefault
        no-bold
        invert-underline
        :href="linkLegalNotice"
      >
        {{ $t('nav.legalNotice') }}
      </LinkDefault>
    </div>
    <div
      v-if="supportEMail != null"
      class="mt-6"
    >
      <LinkDefault
        no-bold
        invert-underline
        :href="`mailto:${supportEMail}?subject=Lightning%20Tip%20Cards%20Feedback`"
      >
        {{ supportEMail }}
      </LinkDefault>
    </div>
    <div class="mt-6">
      TODO : add social links
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
import LinkDefault from '@/components/typography/LinkDefault.vue'

defineProps({
  linkPrivacyPolicy: {
    type: String,
    default: undefined,
  },
  linkLegalNotice: {
    type: String,
    default: undefined,
  },
  supportEMail: {
    type: String,
    default: undefined,
  },
})
</script>
