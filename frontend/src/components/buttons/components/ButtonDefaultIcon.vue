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
        w-full h-full rounded-full
        bg-bluegrey
        transition-transform duration-300
        ltr:group-hover:translate-x-1 ltr:group-active:translate-x-1 rtl:group-hover:-translate-x-1 rtl:group-active:-translate-x-1
      "
    >
      <AnimatedLoadingWheel
        v-if="loading"
        class="text-white"
      />
      <IconArrowRight
        v-else
        class="rtl:-scale-x-100 text-white"
      />
    </span>
  </span>
</template>

<script setup lang="ts">
import IconArrowRight from '@/components/icons/IconArrowRight.vue'
import AnimatedLoadingWheel from '@/components/AnimatedLoadingWheel.vue'

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
