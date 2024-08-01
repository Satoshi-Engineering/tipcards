<template>
  <div class="py-5" data-test="slider-default">
    <div
      ref="slider"
      class="-m-5 overflow-hidden touch-pan-y select-none"
      tabindex="0"
      @pointerdown="onPointerDown"
      @pointermove="onPointerMove"
      @pointerup="onPointerUp"
      @dragstart="onDragStart"
      @keyup.left="previousSlide"
      @keyup.right="nextSlide"
    >
      <ul
        class="flex"
        :class="{ 'transition-transform duration-300 ease-in-out': !pointerDown }"
        :style="`transform: translateX(${translateX}px);`"
      >
        <slot
          :previous-slide="previousSlide"
          :next-slide="nextSlide"
          :current-position="currentSlide"
        />
      </ul>
      <div class="my-2 flex gap-1 justify-center" data-test="slider-default-pagination">
        <button
          v-for="(_, index) in slidesCount"
          :key="`slider-default-pagination-${index}`"
          class="h-1.5 rounded-full bg-bluegrey transition-width duration-300 ease-in-out"
          :class="{
            'w-10': currentSlide === index,
            'w-5 opacity-50': currentSlide !== index,
          }"
          @click="currentSlide = index"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

import { useI18nHelpers } from '@/modules/initI18n'

const { currentTextDirection } = useI18nHelpers()

const MIN_DISTANCE_SWIPED_FOR_SLIDE = 10
const MIN_VELOCITY_FOR_SLIDE = 0.1 // px/ms

/////
// public properties
const slidesCount = ref(0)

const translateX = computed(() => {
  let translateX = translateXForCurrentSlide.value
  translateX = addPointerXDeltaIfNecessary(translateX)
  translateX = applyResistanceIfNecessary(translateX)
  return translateX
})

/////
// public methods
const onPointerDown = (event: PointerEvent) => {
  if (isModifiedMouseEvent(event)) {
    return
  }

  // initialize pointer values
  pointerId.value = event.pointerId
  pointerCaptured.value = false
  pointerDown.value = true
  pointerXStart.value = event.pageX
  previousPointerPositions.value = [{ x: event.pageX, timeStamp: event.timeStamp }]
}

const onPointerMove = (event: PointerEvent) => {
  if (!pointerDown.value || event.pointerId !== pointerId.value) {
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

  // set pointer capture disabled clicks on buttons/links,
  // so we wait for a minimum swipe distance before capturing the pointer
  if (!pointerCaptured.value && minimumSwipeDistanceForSlideReached.value) {
    slider.value?.setPointerCapture(event.pointerId)
    pointerCaptured.value = true
  }
}

const onPointerUp = (event: PointerEvent) => {
  if (!pointerDown.value || event.pointerId !== pointerId.value) {
    return
  }

  const currentPanPosition = Math.abs(translateX.value) / width.value
  let targetPosition = Math.round(currentPanPosition)

  // apply swipe direction (if distance and velocity are sufficient)
  if (currentTextDirection.value === 'ltr') {
    if (swipeDirectionIfDistanceAndVelocitySufficient.value === 'left') {
      targetPosition = Math.ceil(currentPanPosition)
    } else if (swipeDirectionIfDistanceAndVelocitySufficient.value === 'right') {
      targetPosition = Math.floor(currentPanPosition)
    }
  } else {
    if (swipeDirectionIfDistanceAndVelocitySufficient.value === 'left') {
      targetPosition = Math.floor(currentPanPosition)
    } else if (swipeDirectionIfDistanceAndVelocitySufficient.value === 'right') {
      targetPosition = Math.ceil(currentPanPosition)
    }
  }

  resetPointerValues()
  currentSlide.value = Math.max(0, Math.min(targetPosition, slidesCount.value - 1))
}

const onDragStart = (event: DragEvent) => {
  // prevent dragging of all child elements (e.g. images, links, ...)
  // as those would interfere with the dragging of the slides
  event.preventDefault()
}

const previousSlide = () => {
  currentSlide.value = Math.max(currentSlide.value - 1, 0)
}

const nextSlide = () => {
  currentSlide.value = Math.min(currentSlide.value + 1, slidesCount.value - 1)
}

/////
// private properties
const width = ref(0)
const slider = ref<HTMLElement | null>(null)
const currentSlide = ref(0)
const pointerId = ref<number>(0)
const pointerCaptured = ref(false)
const pointerDown = ref(false)
const pointerXStart = ref(0)
const previousPointerPositions = ref<{ x: number, timeStamp: number }[]>([])

const resetPointerValues = () => {
  if (!pointerDown.value) {
    return
  }
  pointerDown.value = false
  if (pointerCaptured.value) {
    slider.value?.releasePointerCapture(pointerId.value)
    pointerCaptured.value = false
  }
}

const translateXForCurrentSlide = computed(() => {
  if (currentTextDirection.value === 'ltr') {
    return -currentSlide.value * width.value
  }
  return currentSlide.value * width.value
})

const maxSlideDistance = computed(() => width.value * (slidesCount.value - 1))

const lastPointerXPosition = computed(() => {
  if (previousPointerPositions.value.length === 0) {
    return 0
  }
  return previousPointerPositions.value[previousPointerPositions.value.length - 1].x
})

const pointerXDelta = computed(() => lastPointerXPosition.value - pointerXStart.value)

const swipeDirectionIfDistanceAndVelocitySufficient = computed<'left' | 'right' | null>(() => {
  if (!minimumSwipeDistanceForSlideReached.value) {
    return null
  }
  if (swipeVelocity.value < -MIN_VELOCITY_FOR_SLIDE) {
    return 'left'
  } else if (swipeVelocity.value > MIN_VELOCITY_FOR_SLIDE) {
    return 'right'
  }
  return null
})

const minimumSwipeDistanceForSlideReached = computed(() => {
  if (previousPointerPositions.value.length < 2) {
    return false
  }
  const first = previousPointerPositions.value[0]
  const last = previousPointerPositions.value[previousPointerPositions.value.length - 1]
  return Math.abs(last.x - first.x) >= MIN_DISTANCE_SWIPED_FOR_SLIDE
})

const swipeVelocity = computed(() => {
  if (previousPointerPositions.value.length < 2) {
    return 0
  }
  const first = previousPointerPositions.value[0]
  const last = previousPointerPositions.value[previousPointerPositions.value.length - 1]
  return (last.x - first.x) / (last.timeStamp - first.timeStamp)
})

/////
// private methods
const isModifiedMouseEvent = (event: PointerEvent) => {
  return (event.button !== 0
    || event.buttons !== 1
    || event.ctrlKey
    || event.metaKey
    || event.altKey
    || event.shiftKey)
}

const outOfBoundsStart = (translateX: number) => {
  if (currentTextDirection.value === 'ltr') {
    return translateX > 0
  }
  return translateX < 0
}

const outOfBoundsEnd = (translateX: number) => {
  if (currentTextDirection.value === 'ltr') {
    return translateX < -maxSlideDistance.value
  }
  return translateX > maxSlideDistance.value
}

const applyResistanceIfNecessary = (translateX: number) => {
  if (outOfBoundsStart(translateX)) {
    return translateX * 0.35
  }
  if (!outOfBoundsEnd(translateX)) {
    return translateX
  }
  if (currentTextDirection.value === 'ltr') {
    return -maxSlideDistance.value + (translateX + maxSlideDistance.value) * 0.35
  }
  return maxSlideDistance.value + (translateX - maxSlideDistance.value) * 0.35
}

const addPointerXDeltaIfNecessary = (translateX: number) => {
  if (!pointerDown.value) {
    return translateX
  }
  return translateX + pointerXDelta.value
}

const init = () => {
  slidesCount.value = slider.value?.querySelectorAll(':scope > ul > .w-full').length || 0
  width.value = slider.value?.getBoundingClientRect().width || 0
}

const onScroll = () => {
  resetPointerValues()
}

onMounted(() => {
  init()
  window.addEventListener('resize', init)
  window.addEventListener('scroll', onScroll)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', init)
  window.removeEventListener('scroll', onScroll)
})
</script>
