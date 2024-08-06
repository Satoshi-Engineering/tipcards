<template>
  <li class="w-full shrink-0 p-5" data-test="slide-default">
    <div class="flex flex-col relative h-full rounded-default overflow-hidden shadow-default bg-white">
      <div
        v-if="$slots.image"
        class="relative rounded-default overflow-hidden shadow-default"
      >
        <slot name="image" />
      </div>
      <div
        class="flex-1 relative px-4 py-6"
      >
        <slot name="default" />
      </div>
    </div>
  </li>
</template>
