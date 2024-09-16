<template>
  <div class="w-full max-w-sm mx-auto rounded-default overflow-hidden shadow-default">
    <template v-if="$slots.headline || headline != null">
      <div class="text-center max-w-sm p-5 mx-auto">
        <slot name="headline">
          <HeadlineDefault level="h3" data-test="lightning-qr-code-headline">
            {{ headline }}
          </HeadlineDefault>
        </slot>
      </div>
      <hr class="border-white-50">
    </template>
    <div
      class="w-full max-w-60 py-12 px-5 mx-auto"
      :class="{ 'py-16': $slots.headline == null && headline == null }"
    >
      <div class="relative">
        <!-- eslint-disable vue/no-v-html -->
        <a
          class="block transition-opacity"
          :class="{ 'opacity-20 blur-sm pointer-events-none': success || pending || loading || error != null }"
          :href="(success || pending || loading || error != null) ? undefined : `lightning:${value}`"
          data-test="lightning-qr-code-image"
          v-html="qrCodeSvg"
        />
        <!-- eslint-enable vue/no-v-html -->
        <div v-if="error != null" class="absolute top-0 left-0 right-0 bottom-0 grid place-items-center text-6xl">
          <IconTriangleExclamationMark class="w-18" />
        </div>
        <div v-else-if="success || pending" class="absolute top-0 left-0 right-0 bottom-0 grid place-items-center">
          <IconAnimatedCheckmark
            class="w-5/12 text-[#22AE73]"
            data-test="lightning-qr-code-image-success"
            :pending="pending && !success"
          />
        </div>
        <div v-else-if="loading" class="absolute top-0 left-0 right-0 bottom-0 grid place-items-center">
          <IconAnimatedLoadingWheel class="w-10 h-10" />
        </div>
      </div>
    </div>
    <hr class="border-white-50">
    <div class="text-right text-sm py-3 px-5">
      <CopyToClipboard
        class="text-right inline-block no-underline font-normal min-h-[3rem]"
        :text="value"
        :error="error"
        :disabled="success || pending || loading"
        data-test="lnurlauth-qrcode-copy-2-clipboard"
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
    <div class="text-center max-w-sm mb-5 px-5 mx-auto">
      <ButtonDefault
        :disabled="success || pending || loading"
        :href="(success || pending || loading || error != null) ? undefined : `lightning:${value}`"
        data-test="lightning-qr-code-button-open-in-wallet"
        class="w-full"
        @click="checkForError"
      >
        {{ t('lightningQrCode.buttonOpenInWallet') }}
      </ButtonDefault>
    </div>
  </div>
</template>

<script setup lang="ts">
import QRCode from 'qrcode-svg'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import sanitizeI18n from '@/modules/sanitizeI18n'
import CopyToClipboard from '@/components/CopyToClipboard.vue'
import ButtonDefault from '@/components/buttons/ButtonDefault.vue'
import IconAnimatedCheckmark from '@/components/icons/IconAnimatedCheckmark.vue'
import IconTriangleExclamationMark from '@/components/icons/IconTriangleExclamationMark.vue'
import HeadlineDefault from './typography/HeadlineDefault.vue'
import IconAnimatedLoadingWheel from './icons/IconAnimatedLoadingWheel.vue'

const props = defineProps({
  headline: {
    type: String,
    default: undefined,
  },
  value: {
    type: String,
    required: true,
  },
  success: {
    type: Boolean,
    default: false,
  },
  pending: {
    type: Boolean,
    default: false,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  error: {
    type: String,
    default: undefined,
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

const checkForError = (event: Event) => {
  if (props.error != null) {
    event.preventDefault()
    alert(props.error)
  }
}
</script>
