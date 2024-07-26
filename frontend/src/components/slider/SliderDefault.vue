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
    translateX += pointerXDelta.value
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
const pointerXStart = ref(0)
const previousPointerPositions = ref<{ x: number, timeStamp: number }[]>([])
const lastPointerXPosition = computed(() => {
  if (previousPointerPositions.value.length === 0) {
    return 0
  }
  return previousPointerPositions.value[previousPointerPositions.value.length - 1].x
})
const pointerXDelta = computed(() => lastPointerXPosition.value - pointerXStart.value)
const swipeDirection = computed<'left' | 'right' | null>(() => {
  if (previousPointerPositions.value.length < 2) {
    return null
  }
  const first = previousPointerPositions.value[0]
  const last = previousPointerPositions.value[previousPointerPositions.value.length - 1]
  if (Math.abs(last.x - first.x) < 10) {
    return null
  }
  const velocity = (last.x - first.x) / (last.timeStamp - first.timeStamp)
  if (velocity < -1) {
    return 'left'
  } else if (velocity > 1) {
    return 'right'
  }
  return null
})

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
  pointerXStart.value = event.pageX
  previousPointerPositions.value = [{ x: event.pageX, timeStamp: event.timeStamp }]
}

const onPointerMove = (event: PointerEvent) => {
  if (!pointerDown.value) {
    return
  }
  // only remember pointer positions in the same direction, and max 20
  let direction: 'left' | 'right' | null = null
  const newPreviousPointerPositions = [{ x: event.pageX, timeStamp: event.timeStamp }]
  for (let x = previousPointerPositions.value.length -1; x >= 0; x--) {
    if (newPreviousPointerPositions.length >= 20) {
      break
    }
    let currentDirection: 'left' | 'right' | null = null
    if (currentDirection == null) {
      if (previousPointerPositions.value[x].x - event.pageX > 0) {
        currentDirection = 'left'
      } else if (previousPointerPositions.value[x].x - event.pageX < 0) {
        currentDirection = 'right'
      }
    }
    if (direction == null) {
      direction = currentDirection
    } else if (direction !== currentDirection) {
      break
    }
    newPreviousPointerPositions.unshift(previousPointerPositions.value[x])
  }
  previousPointerPositions.value = newPreviousPointerPositions
}

const onPointerUp = (event: PointerEvent) => {
  const currentPanPosition = -translateX.value / width.value
  let targetPosition = Math.round(currentPanPosition)
  if (swipeDirection.value === 'left') {
    targetPosition = Math.ceil(currentPanPosition)
  } else if (swipeDirection.value === 'right') {
    targetPosition = Math.floor(currentPanPosition)
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
