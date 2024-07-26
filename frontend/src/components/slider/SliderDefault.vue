<template>
  <div
    ref="slider"
    class="-m-5 overflow-hidden touch-pan-y"
    tabindex="0"
    @pointerdown="onPointerDown"
    @pointermove="onPointerMove"
    @pointerup="onPointerUp"
    @keyup.left="previousSlide"
    @keyup.right="nextSlide"
  >
    <ul
      class="flex"
      :class="{ 'transition-transform duration-300 ease-in-out': !pointerDown }"
      :style="`transform: translateX(${translateX}px); user-select: none;`"
    >
      <slot
        :previous-slide="previousSlide"
        :next-slide="nextSlide"
        :current-position="currentPosition"
      />
    </ul>
    <div class="my-2 flex gap-1 justify-center">
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

const props = defineProps({
  carousel: {
    type: Boolean,
    default: false,
  },
})

const width = ref(0)
const slider = ref<HTMLElement | null>(null)
const slidesCount = ref(0)
const currentPosition = ref(0)

const translateX = computed(() => {
  let translateX = -currentPosition.value * width.value
  if (pointerDown.value) {
    translateX += pointerDeltaX.value
  }
  if (translateX > 0) {
    return translateX * 0.35
  } else if (translateX < -width.value * (slidesCount.value - 1)) {
    return -width.value * (slidesCount.value - 1) + (translateX + width.value * (slidesCount.value - 1)) * 0.35
  }
  return translateX
})

const init = () => {
  slidesCount.value = slider.value?.querySelectorAll(':scope > ul > .w-full').length || 0
  width.value = slider.value?.getBoundingClientRect().width || 0
}

const previousSlide = () => {
  if (props.carousel) {
    currentPosition.value = (currentPosition.value - 1 + slidesCount.value) % slidesCount.value
  } else {
    currentPosition.value = Math.max(currentPosition.value - 1, 0)
  }
}

const nextSlide = () => {
  if (props.carousel) {
    currentPosition.value = (currentPosition.value + 1) % slidesCount.value
  } else {
    currentPosition.value = Math.min(currentPosition.value + 1, slidesCount.value - 1)
  }
}

const pointerDown = ref(false)
const pointerStartClientX = ref(0)
const previousClientX = ref(0)
const pointerDeltaX = computed(() => previousClientX.value - pointerStartClientX.value)
const swipeDirection = computed<'left' | 'right' | null>(() => null)

const onPointerDown = (event: PointerEvent) => {
  if (
    event.target == null
    || !(
      event.target instanceof HTMLElement
      || event.target instanceof HTMLImageElement
    )
  ) {
    return
  }
  const target = event.target as HTMLElement | HTMLImageElement
  if (
    target.tagName === 'BUTTON'
    || target.closest('button')
    || target.tagName === 'A'
    || target.closest('a')
  ) {
    return
  }
  event.preventDefault()
  if (target.hasPointerCapture(event.pointerId)) {
    target.releasePointerCapture(event.pointerId)
  }
  slider.value?.setPointerCapture(event.pointerId)
  pointerDown.value = true
  pointerStartClientX.value = event.pageX
  previousClientX.value = event.pageX
}

const onPointerMove = (event: PointerEvent) => {
  if (!pointerDown.value) {
    return
  }
  previousClientX.value = event.pageX
}

const onPointerUp = (event: PointerEvent) => {
  const currentPanPosition = -translateX.value / width.value
  let targetPosition = Math.round(currentPanPosition)
  if (swipeDirection.value === 'left') {
    targetPosition = Math.floor(currentPanPosition)
  } else if (swipeDirection.value === 'right') {
    targetPosition = Math.ceil(currentPanPosition)
  }
  slider.value?.releasePointerCapture(event.pointerId)
  pointerDown.value = false
  currentPosition.value = Math.max(0, Math.min(targetPosition, slidesCount.value - 1))
}

onMounted(() => {
  init()
  window.addEventListener('resize', init)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', init)
})
</script>
