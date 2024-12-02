<template>
  <figure class="flex flex-col text-center">
    <div class="mx-auto w-8 h-8">
      <slot name="icon" />
    </div>
    <figcaption class="flex-1 flex flex-col my-2">
      <HeadlineDefault level="h4" class="text-sm font-normal mb-0">
        {{ headline }}
      </HeadlineDefault>
      <div class="mt-auto text-lg font-medium whitespace-nowrap">
        <template v-if="amount != null">
          {{ $t('general.amountAndUnitSats', { amount }) }}
        </template>
        <template v-else>
          &nbsp;
        </template>
      </div>
      <div class="pt-2 text-sm font-medium">
        <template v-if="count != null">
          ({{ $t('general.cards', { count }) }})
        </template>
        <template v-else>
          &nbsp;
        </template>
      </div>
    </figcaption>
  </figure>
</template>

<script setup lang="ts">
import HeadlineDefault from '@/components/typography/HeadlineDefault.vue'

defineProps({
  headline: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    default: undefined,
  },
  count: {
    type: Number,
    default: undefined,
  },
})
</script>
