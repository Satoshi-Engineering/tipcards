<template>
  <ParagraphDefault data-test="list-message-not-logged-in">
    <I18nT keypath="header.loginBanner.claim">
      <template #login>
        <LinkDefault @click="showModalLogin = true">
          {{ $t('header.loginBanner.login') }}
        </LinkDefault>
      </template>
    </I18nT>
  </ParagraphDefault>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'

import LinkDefault from '@/components/typography/LinkDefault.vue'
import ParagraphDefault from '@/components/typography/ParagraphDefault.vue'
import { useModalLoginStore } from '@/stores/modalLogin'

const { showModalLogin } = storeToRefs(useModalLoginStore())
</script>
