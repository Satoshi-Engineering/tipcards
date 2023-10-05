<template>
  <ModalDefault
    :headline="$t('components.modalResolveLocalStorage.headline')"
    :close-on-backdrop-click="false"
    :show-close-button="false"
  >
    <template #default>
      <ParagraphDefault>
        {{ $t('components.modalResolveLocalStorage.text') }}
      </ParagraphDefault>
      <ParagraphDefault
        v-for="(error, index) in migratingErrors"
        :key="[error, index].join('_')"
        class="text-red-500"
        dir="ltr"
      >
        {{ error }}
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
      <ButtonDefault variant="no-border" @click="logout">
        {{ $t('components.modalResolveLocalStorage.logout') }}
      </ButtonDefault>
    </template>
  </ModalDefault>
</template>

<script lang="ts" setup>
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'

import ParagraphDefault from '@/components/typography/ParagraphDefault.vue'
import ButtonDefault from '@/components/ButtonDefault.vue'
import ModalDefault from '@/components/ModalDefault.vue'
import { useAuthStore } from '@/stores/auth'
import { useCardsSetsStore } from '@/stores/cardsSets'

const { t } = useI18n()
const { logout } = useAuthStore()
const setsStore = useCardsSetsStore()
const { migrate } = setsStore
const { migrating, migratingErrors } = storeToRefs(setsStore)

const onMigrate = () => {
  if (!confirm(t('components.modalResolveLocalStorage.confirmMigrate'))) {
    return
  }
  migrate()
}
</script>
