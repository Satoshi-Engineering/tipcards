<template>
  <span
    class="
      absolute left-2 top-[50%] translate-y-[-50%]
      w-[30px] h-[30px]
      flex items-center justify-center
      pointer-events-none
      transition-transform duration-300 group-hover:translate-x-1 group-active:translate-x-1
    "
  >
    <span
      class="
        absolute h-full w-full rounded-full -z-10
        bg-bluegrey
      "
      :class="{
        'transition-transform ease-out duration-30 group-hover:duration-400 group-hover:scale-[30]': !reducedAnimation,
      }"
    />
    <AnimatedLoadingWheel
      v-if="loading"
      class="block w-5 h-5"
      color="white"
    />
    <svg
      v-else
      class="w-4"
      viewBox="0 0 14 12"
    >
      <path d="M.875 5.143h10.137L7.255 1.465a.846.846 0 0 1 0-1.214.889.889 0 0 1 1.239 0l5.249 5.142a.848.848 0 0 1 0 1.214l-5.25 5.142a.889.889 0 0 1-1.238 0 .846.846 0 0 1 0-1.214l3.757-3.678H.875A.866.866 0 0 1 0 6c0-.473.392-.857.875-.857z" fill="#FFF" />
    </svg>
  </span>
</template>

<script setup lang="ts">
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
