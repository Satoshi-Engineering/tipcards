<template>
  <div class="overflow-hidden -m-5">
    <ul
      ref="slider"
      class="flex transition-transform duration-300 ease-in-out"
      :style="`transform: translateX(${translateX}px);`"
    >
      <slot :next-slide="nextSlide" :current-position="currentPosition" />
    </ul>
    <div class="mt-2 flex gap-1 justify-center">
      <button
        v-for="index in slidesCount"
        :key="`slider-default-pagination-${index}`"
        class="h-1.5 rounded-full bg-bluegrey transition-width duration-300 ease-in-out"
        :class="{
          'w-10': currentPosition === index - 1,
          'w-5 opacity-50': currentPosition !== index - 1,
        }"
        @click="currentPosition = index - 1"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

const width = ref(0)
const slider = ref<HTMLElement | null>(null)
const slidesCount = ref(0)
const currentPosition = ref(0)

const translateX = computed(() => -width.value * currentPosition.value)

const calculateWidth = () => {
  width.value = slider.value?.getBoundingClientRect().width || 0
}

const nextSlide = () => {
  currentPosition.value = (currentPosition.value + 1) % slidesCount.value
}

onMounted(() => {
  slidesCount.value = slider.value?.querySelectorAll(':scope > .w-full').length || 0
  calculateWidth()
  window.addEventListener('resize', calculateWidth)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', calculateWidth)
})
</script>
