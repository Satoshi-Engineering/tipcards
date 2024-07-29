<template>
  <li class="w-full shrink-0 p-5" data-test="slide-default">
    <div class="flex flex-col relative h-full rounded-xl overflow-hidden shadow-[0_2px_15px_0_rgba(97,97,97,0.3)]">
      <div
        v-if="$slots.image"
        class="relative rounded-xl overflow-hidden shadow-[0_2px_15px_0_rgba(97,97,97,0.3)]"
      >
        <slot name="image" />
      </div>
      <div
        class="flex-1 relative px-4 py-6"
        :class="{ 'flex flex-col justify-center items-center': !$slots.image }"
      >
        <slot name="default" />
      </div>
    </div>
  </li>
</template>
