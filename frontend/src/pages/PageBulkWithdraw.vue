<template>
  <div class="mt-3 mx-auto w-full max-w-md px-4">
    <HeadlineDefault
      level="h1"
      class="mt-10"
    >
      {{ $t('bulkWithdraw.headline') }}
    </HeadlineDefault>
    <p class="my-3">
      <Translation keypath="bulkWithdraw.setName">
        <template #setName>
          <strong>{{ settings.setName || $t('index.unnamedSetNameFallback') }}</strong>
        </template>
      </Translation>
    </p>
    <div v-if="cardLockedByWithdraw != null">
      <p class="mb-4">
        {{ $t('bulkWithdraw.withdrawExists') }}
      </p>
      <ButtonWithTooltip
        type="submit"
        variant="outline"
        @click="resetBulkWithdraw"
      >
        {{ $t('bulkWithdraw.buttonReset') }} 
      </ButtonWithTooltip>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, onBeforeMount, ref, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'


import type { Settings } from '@shared/data/redis/Set'

import type { Card } from '@backend/trpc/data/Card'

import HeadlineDefault from '@/components/typography/HeadlineDefault.vue'
import ButtonWithTooltip from '@/components/ButtonWithTooltip.vue'
import Translation from '@/modules/I18nT'
import hashSha256 from '@/modules/hashSha256'
import useTRpc from '@/modules/useTRpc'
import {
  getDefaultSettings,
  decodeCardsSetSettings,
} from '@/stores/cardsSets'

const route = useRoute()
const router = useRouter()

const { client } = useTRpc()

const setId = computed(() => route.params.setId == null || route.params.setId === '' ? undefined : String(route.params.setId))
const settings = reactive<Settings>(getDefaultSettings())
const cards = ref<Card[]>()

onBeforeMount(() => {
  if (setId.value == null) {
    router.replace({ name: 'home', params: { lang: route.params.lang } })
    return
  }
  loadSettingsFromUrl()
  loadCards()
})

const loadSettingsFromUrl = () => {
  const settingsEncoded = String(route.params.settings)
  try {
    Object.assign(settings, decodeCardsSetSettings(settingsEncoded))
  } catch (e) {
    // do nothing
  }
}

const loadCards = async () => {
  cards.value = await Promise.all([...new Array(settings.numberOfCards).keys()].map(
    async (cardIndex) => client.card.getByHash.query(await hashSha256(`${setId.value}/${cardIndex}`)),
  ))
}

const cardLockedByWithdraw = computed(() => cards.value?.find((card) => card.isLockedByBulkWithdraw))

const resetBulkWithdraw = async () => {
  if (cardLockedByWithdraw.value == null) {
    return
  }
  await client.bulkWithdraw.deleteByCardHash.mutate(cardLockedByWithdraw.value.hash)
}

// todo : if there are no funded cards show info to user (with a back button)
// todo : show the list of cards that are funded (like status list on PageCards) + button for withdraw creation
// todo : on withdraw creaton show withdraw link
// todo : handle loading states
// todo : handle errors
// todo : clean up file (move stuff into sub-components or composables)
</script>
