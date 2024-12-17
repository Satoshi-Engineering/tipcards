<template>
  <ButtonLinkSkeleton
    class="
      -mx-5 px-5 py-4 group-last:pb-6 group-last:rounded-b-default
      grid grid-cols-[1fr,auto] grid-rows-[repeat(2,auto)]
    "
    :to="to"
    :element="to == null ? 'div' : undefined"
    :class="{
      'hover:bg-grey-light': to != null,
    }"
  >
    <div class="col-start-1 place-self-start">
      <div v-if="$slots.preHeadline">
        <slot name="preHeadline" />
      </div>
      <HeadlineDefault level="h4" class="!my-2 first:!mt-0">
        <slot name="headline" />
      </HeadlineDefault>
    </div>
    <div class="col-start-1 text-sm">
      <slot />
    </div>
    <div v-if="$slots.bottomEnd" class="-col-end-1 -row-end-1 mb-1 place-self-end text-sm font-bold">
      <slot name="bottomEnd" />
    </div>
  </ButtonLinkSkeleton>
</template>

<script setup lang="ts">
import type { PropType } from 'vue'
import type { RouteLocationRaw } from 'vue-router'

import HeadlineDefault from '@/components/typography/HeadlineDefault.vue'
import ButtonLinkSkeleton from '@/components/buttons/components/ButtonLinkSkeleton.vue'

defineProps({
  to: {
    type: Object as PropType<RouteLocationRaw>,
    default: undefined,
  },
})
</script>
