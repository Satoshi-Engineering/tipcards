<template>
  <figure class="flex flex-col text-center">
    <div class="mx-auto w-8 h-8">
      <slot name="icon" />
    </div>
    <figcaption class="flex-1 flex flex-col my-2">
      <HeadlineDefault level="h4" class="text-sm font-normal mb-0">
        {{ headline }}
      </HeadlineDefault>
      <div
        class="mt-auto text-lg font-medium whitespace-nowrap"
        :class="{ 'text-grey-medium': amount == null }"
      >
        {{ $t('general.amountAndUnitSats', { amount: amountComputed }, amount ?? 10000) }}
      </div>
      <div
        class="pt-2 text-sm font-medium"
        :class="{ 'text-grey-medium': count == null }"
      >
        ({{ $t('general.cards', { count: countComputed }, count ?? 10000) }})
      </div>
    </figcaption>
  </figure>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import HeadlineDefault from '@/components/typography/HeadlineDefault.vue'

const props = defineProps({
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

const amountComputed = computed(() => props.amount ?? '…')
const countComputed = computed(() => props.count ?? '…')
</script>
