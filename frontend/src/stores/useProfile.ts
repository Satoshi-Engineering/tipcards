import { storeToRefs } from 'pinia'
import { useAuthStore } from './auth'
import useTRpc from '@/modules/useTRpc'
import { computed, ref, watchEffect } from 'vue'

const authStore = useAuthStore()
const { getValidAccessToken } = authStore
const { isLoggedIn } = storeToRefs(authStore)
const { profile } = useTRpc(getValidAccessToken)

const userDisplayName = ref<string>()

watchEffect(async () => {
  if (!isLoggedIn.value) {
    userDisplayName.value = undefined
    return
  }
  try {
    userDisplayName.value = await profile.getDisplayName.query()
  } catch (error) {
    userDisplayName.value = undefined
  }
})

export default () => {
  return {
    userDisplayName: computed(() => userDisplayName.value),
  }
}
