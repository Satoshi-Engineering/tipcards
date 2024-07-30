<template>
  <TheLayout>
    <CenterContainer class="mb-10">
      <HeadlineDefault level="h1">
        {{ t('sets.title') }}
      </HeadlineDefault>
      <ParagraphDefault v-if="!isLoggedIn">
        Your are not logged in. Please
        <LinkDefault @click="showModalLogin = true">
          {{ $t('general.login') }}
        </LinkDefault>
        to list your sets!
      </ParagraphDefault>
    </CenterContainer>
  </TheLayout>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { storeToRefs } from 'pinia'

import TheLayout from '@/components/layout/TheLayout.vue'
import CenterContainer from '@/components/layout/CenterContainer.vue'
import HeadlineDefault from '@/components/typography/HeadlineDefault.vue'
import ParagraphDefault from '@/components/typography/ParagraphDefault.vue'
import LinkDefault from '@/components/typography/LinkDefault.vue'
import { useAuthStore } from '@/stores/auth'
import { useModalLoginStore } from '@/stores/modalLogin'

const { t } = useI18n()
const { isLoggedIn } = storeToRefs(useAuthStore())
const modalLoginStore = useModalLoginStore()
const { showModalLogin } = storeToRefs(modalLoginStore)

</script>
