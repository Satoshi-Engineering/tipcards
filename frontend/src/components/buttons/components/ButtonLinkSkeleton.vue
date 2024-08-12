<template>
  <RouterLink
    v-if="to != null"
    :to="to"
    :class="cssClasses"
    :active-class="activeClass"
    :target="targetComputed"
    :disabled="disabled"
    :tabindex="disabled ? -1 : undefined"
  >
    <slot />
  </RouterLink>
  <a
    v-else-if="href != null"
    :href="href"
    :target="targetComputed"
    :class="cssClasses"
    :tabindex="disabled ? -1 : undefined"
  >
    <slot />
  </a>
  <span
    v-else-if="element === 'span'"
    :class="cssClasses"
  >
    <slot />
  </span>
  <button
    v-else
    class="[text-align:inherit] appearance-none"
    :class="cssClasses"
    :disabled="disabled"
  >
    <slot />
  </button>
</template>

<script setup lang="ts">
import { type PropType, computed, watchEffect, ref } from 'vue'
import { type RouteLocationRaw, RouterLink } from 'vue-router'

const props = defineProps({
  to: {
    type: [String, Object] as PropType<RouteLocationRaw>,
    default: undefined,
  },
  href: {
    type: String,
    default: undefined,
  },
  target: {
    type: String,
    default: undefined,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  element: {
    type: String as PropType<'span' | undefined>,
    default: undefined,
  },
  activeClass: {
    type: String,
    default: undefined,
  },
})

const buttonHasError = ref(false)

watchEffect(() => {
  buttonHasError.value = false
  if (props.to != null && props.href != null) {
    console.warn('ButtonLinkSkeleton: `to` and `href` are mutually exclusive')
    buttonHasError.value = true
    return
  }
  if (props.element == null) {
    return
  }
  if (props.href != null || props.to != null) {
    console.warn('ButtonLinkSkeleton: `to` or `href` are not supported when `element` is set to `span`')
    buttonHasError.value = true
    return
  }
  if (props.activeClass != null && props.to == null) {
    console.warn('ButtonLinkSkeleton: `activeClass` is only supported for rendering RouterLinks (when `to` is set)')
    buttonHasError.value = true
  }
})

const cssClasses = computed(() => [
  {
    'opacity-50 cursor-default pointer-events-none': props.disabled,
    'bg-red-500': buttonHasError.value,
  },
])

const targetComputed = computed(() => {
  if (props.target != null) {
    return props.target
  }
  if (props.href != null && /^https?:\/\/.+/.test(props.href)) {
    return '_blank'
  }
  return undefined
})
</script>
