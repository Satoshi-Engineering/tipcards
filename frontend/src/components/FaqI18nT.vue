<template>
  <I18nT :keypath="keypath" :scope="i18nScope">
    <template #supportEmail>
      <LinkDefault :href="`mailto:${SUPPORT_EMAIL}?subject=Lightning%20Tip%20Cards%20Feedback`">
        {{ SUPPORT_EMAIL }}
      </LinkDefault>
    </template>
    <template #lightningNode>
      <LinkDefault :href="LIGHTNING_NODE_LINK">
        {{ LIGHTNING_NODE_NAME }}
      </LinkDefault>
    </template>
    <template #github>
      <LinkDefault :href="GITHUB_LINK">
        GitHub
      </LinkDefault>
    </template>
    <template #localSetsPage>
      <LinkDefault :to="{ name: 'local-storage-sets', params: { lang: $route.params.lang } }">
        {{ $t('localStorageDeprecation.setsPage.headline') }}
      </LinkDefault>
    </template>
  </I18nT>
</template>

<script setup lang="ts">
import type { PropType } from 'vue'
import { I18nT, type ComponentI18nScope } from 'vue-i18n'

import LinkDefault from './typography/LinkDefault.vue'
import { SUPPORT_EMAIL, LIGHTNING_NODE_NAME, LIGHTNING_NODE_LINK, GITHUB_LINK } from '@/constants'

defineProps({
  keypath: {
    type: String,
    required: true,
  },
  i18nScope: {
    type: String as PropType<ComponentI18nScope>,
    default: 'parent',
  },
})
</script>
