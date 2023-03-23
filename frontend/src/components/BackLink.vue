<template>
  <div
    v-if="!onlyInternalReferrer"
  >
    <LinkDefault
      :to="to"
      target="_self"
      @click="backlinkAction($event)"
    >
      <i class="bi bi-caret-left-fill rtl:hidden" /><!--
      --><i class="bi bi-caret-right-fill ltr:hidden" /><!--
      -->{{ t('general.back') }}
    </LinkDefault>
  </div>
</template>

<script setup lang="ts">
import { computed, type PropType } from 'vue'
import { useRouter, useRoute, type RouteLocationRaw } from 'vue-router'
import { useI18n } from 'vue-i18n'

import LinkDefault from './typography/LinkDefault.vue'

const { t } = useI18n()

const props = defineProps({
  to: {
    type: [String, Object] as PropType<RouteLocationRaw>,
    default: undefined,
  },
  onlyInternalReferrer: {
    type: Boolean,
    default: false,
  },
})

const router = useRouter()
const route = useRoute()

const referrerFromApplication = computed(() => {
  try {
    if (new URL(document.referrer).origin === location.origin && document.referrer !== document.location.href) {
      return true
    }
  } catch (error) {
    return false
  }
  return false
})

const to = computed(() => {
  if (props.to != null) {
    return props.to
  }

  const home = { name: 'home', params: { lang: route.params.lang } }
  if (!referrerFromApplication.value) {
    return home
  }
  try {
    return router.resolve(new URL(document.referrer).pathname)
  } catch (error) {
    return home
  }
})

const backlinkAction = (event: Event) => {
  if (
    props.to != null
    || history.length <= 1
    || !referrerFromApplication.value
    ) {
    return true
  }
  event.preventDefault()
  router.go(-1)
}
</script>
