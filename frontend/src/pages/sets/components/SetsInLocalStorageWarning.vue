<template>
  <div
    v-if="hasSetsInLocalStorage"
    class="text-sm text-grey"
    data-test="sets-in-local-storage-warning"
  >
    <ParagraphDefault>
      {{ t('localStorageDeprecation.message') }}
    </ParagraphDefault>
    <ButtonDefault
      :to="{ name: 'local-storage-sets', params: { lang: $route.params.lang } }"
      variant="secondary"
    >
      {{ t('localStorageDeprecation.buttonToLocalStorageSetsPage') }}
    </ButtonDefault>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

import ButtonDefault from '@/components/buttons/ButtonDefault.vue'
import ParagraphDefault from '@/components/typography/ParagraphDefault.vue'
import useLocalStorageSets from '@/modules/useLocalStorageSets'

const { t } = useI18n()

const { hasSetsInLocalStorage } = useLocalStorageSets()
</script>
