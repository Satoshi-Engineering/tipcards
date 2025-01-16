<template>
  <TheLayout full-width>
    <CenterContainer full-width>
      <BackLink :to="{ name: 'set', params: { setId, lang: $route.params.lang } }" />
      <div v-if="!isLoggedIn" class="my-20">
        <ItemsListMessageNotLoggedIn />
      </div>
      <div v-else-if="loading" class="my-20 grid place-items-center">
        <IconAnimatedLoadingWheel class="w-10 h-10" />
      </div>
      <UserErrorMessages
        v-if="userErrorMessages.length > 0"
        :user-error-messages="userErrorMessages"
      />
      <HeadlineDefault v-if="set" level="h1">
        {{ setNameWithFallback }}
      </HeadlineDefault>
    </CenterContainer>
  </TheLayout>
</template>

<script setup lang="ts">
import { watch } from 'vue'
import { storeToRefs } from 'pinia'

import { useAuthStore } from '@/stores/auth'
import { useSet } from '@/modules/useSet'
import { useSeoHelpers } from '@/modules/seoHelpers'
import TheLayout from '@/components/layout/TheLayout.vue'
import ItemsListMessageNotLoggedIn from '@/components/itemsList/components/ItemsListMessageNotLoggedIn.vue'
import IconAnimatedLoadingWheel from '@/components/icons/IconAnimatedLoadingWheel.vue'
import UserErrorMessages from '@/components/UserErrorMessages.vue'
import HeadlineDefault from '@/components/typography/HeadlineDefault.vue'
import BackLink from '@/components/BackLink.vue'
import CenterContainer from '@/components/layout/CenterContainer.vue'

const props = defineProps({
  setId: {
    type: String,
    required: true,
  },
})

const { isLoggedIn } = storeToRefs(useAuthStore())
const { setDocumentTitle } = useSeoHelpers()
const { set, loading, userErrorMessages, displayName: setNameWithFallback } = useSet(props.setId)

watch(set, () => {
  if (set.value == null) {
    return
  }
  setDocumentTitle(setNameWithFallback.value)
})
</script>
