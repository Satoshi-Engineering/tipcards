<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="100%"
    height="100%"
    viewBox="0 0 256 256"
  >
    <!-- eslint-disable vue/no-v-html -->
    <g v-html="qrCodeSvg" />
    <!-- eslint-enable vue/no-v-html -->
    <IconLogoBitcoin
      v-if="selectedCardLogo === 'bitcoin'"
      :width="0.26 * 256"
      :height="0.26 * 256"
      :x="0.37 * 256"
      :y="0.37 * 256"
    />
    <IconLogoLightning
      v-else-if="selectedCardLogo === 'lightning'"
      :width="0.26 * 256"
      :height="0.26 * 256"
      :x="0.37 * 256"
      :y="0.37 * 256"
    />
    <svg
      v-else-if="selectedCardLogo != null"
      :width="0.3 * 256"
      :height="0.3 * 256"
      :x="0.35 * 256"
      :y="0.35 * 256"
    >
      <image
        :href="`${BACKEND_API_ORIGIN}/api/assets/cardLogos/${selectedCardLogo.id}.${selectedCardLogo.type}`"
        :width="0.3 * 256"
        :height="0.3 * 256"
      />
    </svg>
  </svg>
</template>

<script setup lang="ts">
import { computed, type PropType } from 'vue'
import QRCode from 'qrcode-svg'

import type { SelectedCardLogo } from '@/modules/useCardLogos'
import { BACKEND_API_ORIGIN } from '@/constants'
import IconLogoBitcoin from '@/components/icons/IconLogoBitcoin.vue'
import IconLogoLightning from '@/components/icons/IconLogoLightning.vue'

const props = defineProps({
  text: {
    type: String,
    required: true,
  },
  selectedCardLogo: {
    type: [Object, String] as PropType<SelectedCardLogo>,
    default: undefined,
  },
})

const qrCodeSvg = computed(() => {
  return getQrCodeForUrl(props.text)
})

const getQrCodeForUrl = (url: string) =>
  new QRCode({
    content: url,
    padding: 0,
    join: true,
    xmlDeclaration: false,
    container: 'none',
  }).svg()
</script>
