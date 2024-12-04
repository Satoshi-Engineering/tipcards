<template>
  <ItemsListWithLoading
    :items="items"
    :loading="loading"
    :reloading="reloading"
    :header-primary="headerPrimary"
    :header-secondary="headerSecondary"
    data-test="items-list"
  >
    <template v-if="$slots.message" #message>
      <slot name="message" />
    </template>
    <template v-else-if="notLoggedIn" #message>
      <slot name="notLoggedInMessage">
        <ItemsListMessageNotLoggedIn data-test="items-list-message-not-logged-in" />
      </slot>
    </template>
    <template v-else-if="userErrorMessages.length > 0" #message>
      <UserErrorMessages :user-error-messages="userErrorMessages" data-test="items-list-message-error" />
    </template>
    <template v-else-if="!loading && !reloading && items.length < 1" #message>
      <slot name="listEmptyMessage">
        <ParagraphDefault data-test="items-list-message-no-items">
          {{ $t('general.noItems') }}
        </ParagraphDefault>
      </slot>
    </template>

    <template #default="{ item }">
      <slot name="default" :item="item" />
    </template>
  </ItemsListWithLoading>
</template>

<script setup lang="ts" generic="T">
import type { PropType } from 'vue'

import UserErrorMessages from '@/components/UserErrorMessages.vue'
import ItemsListMessageNotLoggedIn from '@/components/itemsList/components/ItemsListMessageNotLoggedIn.vue'
import ParagraphDefault from '@/components/typography/ParagraphDefault.vue'
import ItemsListWithLoading from '@/components/itemsList/ItemsListWithLoading.vue'

defineProps({
  items: {
    type: Array as PropType<T[]>,
    required: true,
  },
  headerPrimary: {
    type: String,
    required: true,
  },
  headerSecondary: {
    type: String,
    default: undefined,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  reloading: {
    type: Boolean,
    default: false,
  },
  notLoggedIn: {
    type: Boolean,
    default: false,
  },
  userErrorMessages: {
    type: Array as PropType<string[]>,
    required: false,
    default: () => [],
  },
})
</script>
