<template>
  <div class="relative w-full max-w-xs p-10 pb-3 mx-auto">
    <!-- eslint-disable vue/no-v-html -->
    <a
      class="block transition-opacity"
      :class="{ 'opacity-20 blur-sm pointer-events-none': success }"
      :href="!success ? `lightning:${value}`: undefined"
      v-html="qrCodeSvg"
    />
    <!-- eslint-enable vue/no-v-html -->
    <div v-if="success" class="absolute top-10 left-10 right-10 bottom-3 grid place-items-center">
      <AnimatedCheckmark class="w-5/12" />
    </div>
  </div>
  <div class="text-center max-w-xs px-8 mx-auto">
    <ButtonDefault
      :disabled="success"
      :href="!success ? `lightning:${value}`: undefined"
      class="w-full"
    >
      {{ t('lightningQrCode.buttonOpenInWallet') }}
    </ButtonDefault>
  </div>
  <div class="text-center text-xs px-10 mb-5">
    <CopyToClipboard
      :text="value"
      class="text-center inline-block no-underline font-normal min-h-[3rem]"
    >
      <template #default>
        <span class="font-normal">
          <I18nT :keypath="type === 'lnurl' ? 'lightningQrCode.copyToClipboard.lnurl.beforeCopy' : 'lightningQrCode.copyToClipboard.invoice.beforeCopy'">
            <template #action>
              <br>
              <strong class="underline hover:no-underline">{{ t(type === 'lnurl' ? 'lightningQrCode.copyToClipboard.lnurl.beforeCopyAction' : 'lightningQrCode.copyToClipboard.invoice.beforeCopyAction') }}</strong>
              <br>
            </template>
          </I18nT>
        </span>
      </template>
      <template #success>
        <strong>{{ t(type === 'lnurl' ? 'lightningQrCode.copyToClipboard.lnurl.afterCopySuccess' : 'lightningQrCode.copyToClipboard.invoice.afterCopySuccess') }}</strong>
        <br>
        <!-- eslint-disable-next-line vue/no-v-html -->
        <span v-html="sanitizeI18n(t(type === 'lnurl' ? 'lightningQrCode.copyToClipboard.lnurl.afterCopyNextStep' : 'lightningQrCode.copyToClipboard.invoice.afterCopyNextStep'))" />
      </template>
    </CopyToClipboard>
  </div>
</template>

<script setup lang="ts">
import QRCode from 'qrcode-svg'
import { computed } from 'vue'
import { useI18n, Translation as I18nT } from 'vue-i18n'

import sanitizeI18n from '@/modules/sanitizeI18n'
import CopyToClipboard from '@/components/CopyToClipboard.vue'
import ButtonDefault from '@/components/ButtonDefault.vue'
import AnimatedCheckmark from '@/components/AnimatedCheckmark.vue'

const props = defineProps({
  value: {
    type: String,
    required: true,
  },
  success: {
    type: Boolean,
    default: false,
  },
})

const { t } = useI18n()

const qrCodeSvg = computed<string>(() => props.value != null ? new QRCode({
    content: props.value,
    container: 'svg-viewbox',
    join: true,
    padding: 0,
  }).svg() : '')

const type = computed(() => props.value.toLowerCase().startsWith('lnurl') ? 'lnurl' : 'invoice')
</script>
