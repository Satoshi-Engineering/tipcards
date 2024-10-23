<template>
  <ul class="w-full">
    <li
      v-for="{
        hash,
        shared, amount, noteForStatusPage,
        funded, withdrawn,
        isLockedByBulkWithdraw,
        landingPageViewed,
      } in cards"
      :key="hash"
      class="py-1 border-b border-grey"
    >
      <CardStatus
        :status="withdrawn != null ? 'used' : 'funded'"
        :funded-date="funded != null ? funded.getTime() / 1000 : undefined"
        :used-date="withdrawn != null ? withdrawn.getTime() / 1000 : undefined"
        :shared="shared"
        :amount="amount.funded || undefined"
        :note="noteForStatusPage"
        :url="getLandingPageUrlWithCardHash(hash, settings.landingPage || undefined)"
        :viewed="landingPageViewed != null"
        :is-locked-by-bulk-withdraw="isLockedByBulkWithdraw"
      />
    </li>
  </ul>
</template>

<script lang="ts" setup>
import { onBeforeMount, reactive, type PropType } from 'vue'
import { useRoute } from 'vue-router'

import type { Settings } from '@shared/data/api/Set'
import type { Card } from '@shared/data/trpc/Card'

import CardStatus from '@/components/CardStatus.vue'
import useLandingPages from '@/modules/useLandingPages'
import { getDefaultSettings, decodeCardsSetSettings } from '@/stores/cardsSets'

const route = useRoute()

const { getLandingPageUrlWithCardHash } = useLandingPages()

defineProps({
  cards: {
    type: Array as PropType<Card[]>,
    required: true,
  },
})

const settings = reactive<Settings>(getDefaultSettings())
onBeforeMount(() => {
  loadSettingsFromUrl()
})
const loadSettingsFromUrl = () => {
  const settingsEncoded = String(route.params.settings)
  try {
    Object.assign(settings, decodeCardsSetSettings(settingsEncoded))
  } catch {
    // do nothing
  }
}
</script>
