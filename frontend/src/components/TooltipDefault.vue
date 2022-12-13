<template>
  <span
    ref="trigger"
    class="inline-grid"
    v-bind="$attrs"
    :tabindex="(!disabled && (content != null || $slots.content != null)) ? 0 : -1"
    @mouseenter="hoverShow"
    @mouseleave="hoverHide"
    @focus="showTooltip"
    @blur="hideTooltip"
  >
    <slot />
  </span>
  <div
    v-if="!disabled && (content != null || $slots.content != null)"
    ref="tooltip"
    role="tooltip"
    class="tooltip absolute z-50 bg-grey-light max-w-[min(24rem,calc(100vw-(100vw-100%)-16px))] border border-grey p-3 rounded-lg opacity-0 transition-opacity pointer-events-none text-sm"
    :class="{ 'opacity-100 pointer-events-auto': show }"
    :data-popper-placement="placement"
    @focusin="showTooltip"
    @focusout="hideTooltip"
  >
    <slot name="content">
      {{ content }}
    </slot>
    <span
      class="
        arrow
        absolute w-3 h-3 bg-inherit invisible
        before:absolute before:w-3 before:h-3 before:bg-inherit
        before:visible before:rotate-45
        before:border before:border-grey
      "
      data-popper-arrow
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, type PropType, onUnmounted, nextTick, watch } from 'vue'
// import Popper from 'vue3-popper'
import { createPopper, type Instance, type ModifierArguments, type Placement } from '@popperjs/core'

const props = defineProps({
  hover: {
    type: Boolean,
    default: true,
  },
  content: {
    type: String,
    default: undefined,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  placement: {
    type: String as PropType<Placement>,
    default: 'bottom',
  },
})

const show = ref(false)

const trigger = ref<HTMLElement | null>(null)
const tooltip = ref<HTMLElement | null>(null)

let popperInstance: Instance

const initPopper = () => {
  if (trigger.value == null || tooltip.value == null) {
    return
  }
  popperInstance = createPopper(trigger.value, tooltip.value, {
    placement: props.placement,
    modifiers: [
      {
        name: 'offset',
        options: {
          offset: [0, 9],
        },
      },
      {
        name: 'preventOverflow',
        options: {
          padding: 8,
        },
      },
    ],
  })

  if (props.hover) {
    return
  }
  window.addEventListener('click', (event) => {
    if (
      event.target === tooltip.value
      || event.target === trigger.value
      || event.composedPath().includes(tooltip.value as EventTarget)
      || event.composedPath().includes(trigger.value as EventTarget)
    ) {
      return
    }
    hideTooltip()
  })
}

const destroyPopper = () => {
  if (popperInstance == null) {
    return
  }
  popperInstance.destroy()
}

onMounted(initPopper)

onUnmounted(destroyPopper)

const showTooltip = () => {
  // Make the tooltip visible
  show.value = true

  if (popperInstance == null) {
    return
  }
  // Enable the event listeners
  popperInstance.setOptions((options) => ({
    ...options,
    modifiers: [
      ...options.modifiers as ModifierArguments<object>[],
      { name: 'eventListeners', enabled: true },
    ],
  }))

  // Update its position
  popperInstance.update()
}

const hideTooltip = async () => {
  await nextTick()
  if (tooltip.value?.contains(document.activeElement)) {
    return
  }

  // Hide the tooltip
  show.value = false

  if (popperInstance == null) {
    return
  }
  // Disable the event listeners
  popperInstance.setOptions((options) => ({
    ...options,
    modifiers: [
      ...options.modifiers as ModifierArguments<object>[],
      { name: 'eventListeners', enabled: false },
    ],
  }))
}

const hoverShow = () => {
  if (props.hover) {
    showTooltip()
  }
}

const hoverHide = () => {
  if (props.hover) {
    hideTooltip()
  }
}

watch(() => props.content, async () => {
  await nextTick()
  destroyPopper()
  initPopper()
})

watch(() => props.disabled, async () => {
  await nextTick()
  destroyPopper()
  initPopper()
})

</script>

<style scoped lang="postcss">
.tooltip[data-popper-placement^='top'] > .arrow {
  @apply -bottom-[7px] before:border-t-0 before:border-l-0;
}

.tooltip[data-popper-placement^='bottom'] > .arrow {
  @apply -top-[7px] before:border-b-0 before:border-r-0;
}

.tooltip[data-popper-placement^='left'] > .arrow {
  @apply -right-[7px] before:border-b-0 before:border-l-0;
}

.tooltip[data-popper-placement^='right'] > .arrow {
  @apply -left-[7px] before:border-t-0 before:border-r-0;
}
</style>
