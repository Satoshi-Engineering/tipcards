<template>
  <ModalDefault :headline="$t('localStorageDeprecation.modalHeadline')" @close="$emit('close')">
    <template #default>
      <ParagraphDefault>
        {{ $t('localStorageDeprecation.modalText') }}
      </ParagraphDefault>
      <ParagraphDefault>
        {{ $t('localStorageDeprecation.modalDeprecationHint') }}
      </ParagraphDefault>
    </template>
    <template #footer>
      <ButtonDefault
        class="mr-3"
        @click="$emit('login')"
      >
        {{ $t('localStorageDeprecation.modalLogin') }}
      </ButtonDefault>
      <ButtonDefault variant="no-border" @click="$emit('close')">
        {{ $t('localStorageDeprecation.modalClose') }}
      </ButtonDefault>
    </template>
  </ModalDefault>
</template>

<script lang="ts" setup>
import ButtonDefault from '@/components/ButtonDefault.vue'
import ModalDefault from '@/components/ModalDefault.vue'
import ParagraphDefault from '@/components/typography/ParagraphDefault.vue'

defineEmits(['login', 'close'])
</script>
