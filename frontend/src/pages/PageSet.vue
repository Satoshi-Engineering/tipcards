<template>
  <TheLayout>
    <CenterContainer>
      <BackLink :to="{ name: 'sets', params: { lang: $route.params.lang } }" class="mb-5 " />
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
    </CenterContainer>
  </TheLayout>
</template>

<script setup lang="ts">
import { watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'

import { useAuthStore } from '@/stores/auth'
import { encodeCardsSetSettingsFromDto } from '@/utils/cardsSetSettings'
import TheLayout from '@/components/layout/TheLayout.vue'
import CenterContainer from '@/components/layout/CenterContainer.vue'
import IconAnimatedLoadingWheel from '@/components/icons/IconAnimatedLoadingWheel.vue'
import UserErrorMessages from '@/components/UserErrorMessages.vue'
import ItemsListMessageNotLoggedIn from '@/components/itemsList/components/ItemsListMessageNotLoggedIn.vue'
import { useSet } from '@/modules/useSet'
import BackLink from '@/components/BackLink.vue'

const props = defineProps({
  setId: {
    type: String,
    required: true,
  },
})

const router = useRouter()
const { isLoggedIn } = storeToRefs(useAuthStore())

const { set, loading, userErrorMessages } = useSet(props.setId)

const redirectToCardsPage = async () => {
  if (set.value == null) {
    return
  }
  const encodedSettings = encodeCardsSetSettingsFromDto(set.value.settings)
  router.replace({
    name: 'cards',
    params: {
      setId: props.setId,
      settings: encodedSettings,
      lang: router.currentRoute.value.params.lang,
    },
  })
}

watch(set, redirectToCardsPage)
</script>
