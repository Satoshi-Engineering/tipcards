<template>
  <span
    class="
      absolute start-2 top-1/2 -translate-y-1/2
      w-[30px] h-[30px]
      pointer-events-none
    "
  >
    <span
      v-if="!reducedAnimation"
      class="
        absolute start-0 h-full w-full rounded-full
        bg-bluegrey
        opacity-100
        transition-transform ease-out duration-30 group-hover:duration-400 group-hover:scale-[30]
      "
    />
    <span
      class="
        flex items-center justify-center
        absolute start-0 top-0
        w-full h-full
        transition-transform duration-300
        ltr:group-hover:translate-x-1 ltr:group-active:translate-x-1 rtl:group-hover:-translate-x-1 rtl:group-active:-translate-x-1
      "
    >
      <IconWithBackground
        :icon="loading ? 'loading' : 'arrow'"
        class="w-full h-full text-white"
      />
    </span>
  </span>
</template>

<script setup lang="ts">
import IconWithBackground from '@/components/buttons/components/IconWithBackground.vue'

defineProps({
  loading: {
    type: Boolean,
    default: false,
  },
  reducedAnimation: {
    type: Boolean,
    default: false,
  },
})
</script>
