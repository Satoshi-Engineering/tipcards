<template>
  <ItemsListBase
    :items="items"
  >
    <template #header>
      <HeadlineDefault
        level="h3"
        styling="h4"
        class="text-sm font-normal !my-0"
      >
        {{ headerPrimary }}
      </HeadlineDefault>
      <IconAnimatedLoadingWheel
        class="w-5 h-5 text-white-50 opacity-0 pointer-events-none select-none"
        :class="{ 'opacity-100': reloading }"
        data-test="items-list-reloading-icon"
      />
      <HeadlineDefault
        v-if="headerSecondary != null"
        level="h3"
        styling="h4"
        class="text-sm font-normal !my-0 ms-auto"
      >
        {{ headerSecondary }}
      </HeadlineDefault>
    </template>

    <template v-if="$slots.message" #beforeList>
      <div v-if="$slots.message" class="px-5 py-8 min-h-44 grid place-items-center text-center">
        <slot name="message" />
      </div>
    </template>

    <template #default="{ item }">
      <slot name="default" :item="item" />
    </template>

    <template v-if="loading" #afterList>
      <div
        class="flex justify-center mx-5"
        :class="{
          'min-h-32': items.length < 1,
          'min-h-14 border-t border-white-50': items.length > 0,
        }"
      >
        <IconAnimatedLoadingWheel
          class="h-auto mx-auto text-white-50"
          :class="{
            'w-10': items.length < 1,
            'w-5': items.length > 0,
          }"
          :data-test="items.length > 0 ? 'items-list-loading-icon--small' : 'items-list-loading-icon--large'"
        />
      </div>
    </template>
  </ItemsListBase>
</template>

<script setup lang="ts" generic="T">
import type { PropType } from 'vue'

import ItemsListBase from '@/components/itemsList/ItemsListBase.vue'
import HeadlineDefault from '@/components/typography/HeadlineDefault.vue'
import IconAnimatedLoadingWheel from '@/components/icons/IconAnimatedLoadingWheel.vue'

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
})
</script>
