<template>
  <ModalDefault
    :headline="$t('components.modalResolveLocalStorage.headline')"
    :close-on-backdrop-click="false"
    :show-close-button="false"
  >
    <template #default>
      {{ $t('components.modalResolveLocalStorage.text') }}
      <ParagraphDefault
        v-if="migratingError"
        class="text-red-500"
        dir="ltr"
      >
        {{ $t('components.modalResolveLocalStorage.migratingError') }}
      </ParagraphDefault>
    </template>
    <template #footer>
      <ButtonDefault
        class="mr-3"
        :disabled="migrating"
        :loading="migrating"
        @click="onMigrate"
      >
        {{ $t('components.modalResolveLocalStorage.migrate') }}
      </ButtonDefault>
      <ButtonDefault variant="outline" @click="logout">
        {{ $t('components.modalResolveLocalStorage.logout') }}
      </ButtonDefault>
    </template>
  </ModalDefault>
</template>

<script lang="ts" setup>
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'

import ButtonDefault from '@/components/ButtonDefault.vue'
import ModalDefault from '@/components/ModalDefault.vue'
import { useUserStore } from '@/stores/user'
import { useCardsSetsStore } from '@/stores/cardsSets'

const { t } = useI18n()
const { logout } = useUserStore()
const setsStore = useCardsSetsStore()
const { migrate } = setsStore
const { migrating, migratingError } = storeToRefs(setsStore)

const onMigrate = () => {
  if (!confirm(t('components.modalResolveLocalStorage.confirmMigrate'))) {
    return
  }
  migrate()
}
</script>
