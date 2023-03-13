<template>
  <div class="flex gap-1.5 text-sm">
    <div
      class="w-3 h-3 mt-1 rounded-full flex-none"
      :class="{
        'bg-btcorange': status === 'funded',
        'bg-lightningpurple': status === 'used',
        'bg-red-500': status === 'error',
        'bg-grey': status === 'lnurlp' || status === 'invoice' || status === 'setFunding',
      }"
    />
    <div class="flex-1">
      <div class="flex justify-between">
        <a :href="url">
          <div v-if="(status === 'used' && usedDate != null)">
            <strong>{{ t('cards.status.labelUsed', 1) }}:</strong>
            {{
              $d(usedDate * 1000, {
                year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric'
              })
            }}
          </div>
          <div v-if="((status === 'funded' || status === 'used') && fundedDate != null)">
            <strong v-if="status !== 'used'">{{ t('cards.status.labelFunded', 1) }}:</strong>
            <span v-else>{{ t('cards.status.labelFunded', 1) }}:</span>
            {{
              $d(fundedDate * 1000, {
                year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric'
              })
            }}
          </div>
          <div v-else-if="(status === 'lnurlp' && shared)">
            <strong>{{ t('cards.status.labelPendingSharedFunding') }}</strong>
          </div>
          <div v-else-if="(status === 'lnurlp' || status === 'invoice')">
            <strong :title="status">{{ t('cards.status.labelPendingFunding') }}</strong>
          </div>
          <div v-else-if="(status === 'setFunding')">
            <strong :title="status">{{ t('cards.status.labelPendingSetFunding') }}</strong>
          </div>
          <div v-else-if="(status === 'error')">
            <strong>Error</strong>
          </div>
        </a>
        <div
          v-if="(status === 'funded' || status === 'used' || (status === 'lnurlp' && shared)) && amount != null"
          class="text-right"
        >
          {{ amount }}&nbsp;sats
        </div>
      </div>
      <div
        v-if="note != null"
      >
        {{ t('cards.status.labelNote') }}: <strong class="font-medium">{{ note }}</strong>
      </div>
      <div
        v-if="viewed && status !== 'used'"
      >
        {{ t('cards.status.labelViewed') }} 👀
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n'

defineProps({
  status: {
    type: String,
    default: null,
  },
  url: {
    type: String,
    required: true,
  },
  usedDate: {
    type: Number,
    default: null,
  },
  fundedDate: {
    type: Number,
    default: null,
  },
  shared: {
    type: Boolean,
    default: false,
  },
  amount: {
    type: Number,
    default: null,
  },
  note: {
    type: String,
    default: null,
  },
  viewed: {
    type: Boolean,
    default: false,
  },
})

const { t } = useI18n()
</script>
