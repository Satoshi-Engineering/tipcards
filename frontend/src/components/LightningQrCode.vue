<template>
  <div class="relative w-full max-w-xs p-10 pb-3 mx-auto">
    <!-- eslint-disable vue/no-v-html -->
    <a
      class="block transition-opacity"
      :class="{ 'opacity-20 blur-sm pointer-events-none': success || pending || error != null }"
      :href="(success || pending || error != null) ? undefined : `lightning:${value}`"
      v-html="qrCodeSvg"
    />
    <!-- eslint-enable vue/no-v-html -->
    <div v-if="error != null" class="absolute top-10 left-10 right-10 bottom-3 grid place-items-center text-6xl">
      <IconWarning class="w-18" />
    </div>
    <div v-else-if="success || pending" class="absolute top-10 left-10 right-10 bottom-3 grid place-items-center">
      <AnimatedCheckmark
        class="w-5/12"
        :pending="pending && !success"
      />
    </div>
  </div>
  <div class="text-center max-w-xs px-8 mx-auto">
    <ButtonDefault
      :disabled="success || pending"
      :href="(success || pending || error != null) ? undefined : `lightning:${value}`"
      class="w-full"
      @click="checkForError"
    >
      {{ t('lightningQrCode.buttonOpenInWallet') }}
    </ButtonDefault>
  </div>
  <div class="text-center text-xs px-10 mb-5">
    <CopyToClipboard
      class="text-center inline-block no-underline font-normal min-h-[3rem]"
      :text="value"
      :error="error"
      :disabled="success || pending"
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
import { useI18n } from 'vue-i18n'

import sanitizeI18n from '@/modules/sanitizeI18n'
import CopyToClipboard from '@/components/CopyToClipboard.vue'
import ButtonDefault from '@/components/buttons/ButtonDefault.vue'
import AnimatedCheckmark from '@/components/AnimatedCheckmark.vue'
import IconWarning from '@/components/svgs/IconWarning.vue'

const props = defineProps({
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
