<template>
  <TheLayout>
    <CenterContainer>
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
import { onMounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

import useTRpc from '@/modules/useTRpc'
import { useAuthStore } from '@/stores/auth'
import { encodeCardsSetSettingsFromDto } from '@/utils/cardsSetSettings'
import TheLayout from '@/components/layout/TheLayout.vue'
import CenterContainer from '@/components/layout/CenterContainer.vue'
import IconAnimatedLoadingWheel from '@/components/icons/IconAnimatedLoadingWheel.vue'
import UserErrorMessages from '@/components/UserErrorMessages.vue'
import ItemsListMessageNotLoggedIn from '@/components/itemsList/components/ItemsListMessageNotLoggedIn.vue'

const props = defineProps({
  setId: {
    type: String,
    required: true,
  },
})

const { t } = useI18n({ useScope: 'global' })
const router = useRouter()
const { set } = useTRpc()
const { isLoggedIn } = storeToRefs(useAuthStore())
const loading = ref(false)
const userErrorMessages = ref<string[]>([])

const loadSet = async () => {
  userErrorMessages.value = []
  if (!isLoggedIn.value) {
    return
  }
  loading.value = true
  try {
    const setDto = await set.getById.query(props.setId)
    const encodedSettings = encodeCardsSetSettingsFromDto(setDto.settings)
    router.replace({
      name: 'cards',
      params: {
        setId: props.setId,
        settings: encodedSettings,
        lang: router.currentRoute.value.params.lang,
      },
    })
  } catch(error) {
    console.error(error)
    userErrorMessages.value = [t('set.errors.unableToLoadSetFromBackend')]
  } finally {
    loading.value = false
  }
}

onMounted(loadSet)
watch(isLoggedIn, loadSet)
</script>
