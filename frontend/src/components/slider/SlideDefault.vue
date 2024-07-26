<template>
  <li class="w-full shrink-0 p-5">
    <div class="relative h-full rounded-xl overflow-hidden shadow-[0_2px_15px_0_rgba(97,97,97,0.3)]">
      <slot :active="active" />
      <button
        class="
          absolute end-3 bottom-3
          w-[30px] h-[30px] rounded-full
          flex items-center justify-center
          bg-bluegrey
        "
        :tabindex="active ? 0 : -1"
        @click="$emit('nextSlide')"
      >
        <svg
          class="w-4 rtl:-scale-x-100"
          viewBox="0 0 14 12"
        >
          <path d="M.875 5.143h10.137L7.255 1.465a.846.846 0 0 1 0-1.214.889.889 0 0 1 1.239 0l5.249 5.142a.848.848 0 0 1 0 1.214l-5.25 5.142a.889.889 0 0 1-1.238 0 .846.846 0 0 1 0-1.214l3.757-3.678H.875A.866.866 0 0 1 0 6c0-.473.392-.857.875-.857z" fill="#FFF" />
        </svg>
      </button>
    </div>
  </li>
</template>

<script setup lang="ts">
defineEmits(['nextSlide'])

defineProps({
  active: {
    type: Boolean,
    default: false,
  },
})
</script>
