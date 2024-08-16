import axios from 'axios'
import { storeToRefs } from 'pinia'
import { computed, nextTick, ref, watch } from 'vue'

import i18n from '@/modules/initI18n'
import useTRpc from '@/modules/useTRpc'
import { useAuthStore } from '@/stores/auth'

///// public
const userAccountName = ref<string>()
const userDisplayName = ref<string>()
const userEmail = ref<string>()

const fetching = ref(false)
const fetchingUserErrorMessages = ref<string[]>([])

const subscribe = async (): Promise<void> => {
  subscribed.value = true
  const promise = new Promise<void>((resolve, reject) => {
    callbacks.push({ resolve, reject })
  })
  startLoadingProfile()
  return promise
}

const unsubscribe = (): void => {
  subscribed.value = false
}

export default () => {
  return {
    userAccountName: computed(() => userAccountName.value),
    userDisplayName: computed(() => userDisplayName.value),
    userEmail: computed(() => userEmail.value),
    fetching: computed(() => fetching.value),
    fetchingUserErrorMessages: computed(() => fetchingUserErrorMessages.value),
    subscribe,
    unsubscribe,
  }
}

///// private
const { t } = i18n.global
const authStore = useAuthStore()
const { getValidAccessToken } = authStore
const { isLoggedIn } = storeToRefs(authStore)
const { profile } = useTRpc(getValidAccessToken)

const subscribed = ref(false)
const callbacks: { resolve: CallableFunction, reject: CallableFunction }[] = []
let abortController: AbortController | null = null

const startLoadingProfile = async () => {
  if (!isLoggedIn.value) {
    callbacks.forEach(({ resolve }) => resolve())
    return
  }
  if (fetching.value) {
    return
  }
  try {
    await loadProfile()
    callbacks.forEach(({ resolve }) => resolve())
  } catch (error) {
    callbacks.forEach(({ reject }) => reject())
  } finally {
    callbacks.length = 0
  }
}

const loadProfile = async () => {
  if (fetching.value) {
    return
  }
  fetching.value = true
  fetchingUserErrorMessages.value = []
  abortController = new AbortController()
  try {
    const profileDto = await profile.get.query(undefined, { signal: abortController.signal })
    userAccountName.value = profileDto.accountName
    userDisplayName.value = profileDto.displayName
    userEmail.value = profileDto.email
  } catch (error) {
    if (!axios.isCancel(error)) {
      console.error(error)
      fetchingUserErrorMessages.value.push(t('stores.profile.errors.unableToLoadFromBackend'))
      throw error
    }
  } finally {
    abortController = null
    fetching.value = false
  }
}

const loadDisplayName = async () => {
  if (fetching.value) {
    return
  }
  fetching.value = true
  fetchingUserErrorMessages.value = []
  abortController = new AbortController()
  try {
    userDisplayName.value = await profile.getDisplayName.query(undefined, { signal: abortController.signal })
  } catch (error) {
    if (!axios.isCancel(error)) {
      console.error(error)
    }
    userDisplayName.value = undefined
  } finally {
    abortController = null
    fetching.value = false
  }
}

watch(isLoggedIn, async () => {
  if (abortController != null) {
    abortController.abort()
    await nextTick()
  }

  if (!isLoggedIn.value) {
    userAccountName.value = undefined
    userDisplayName.value = undefined
    userEmail.value = undefined
    return
  }

  if (subscribed.value) {
    startLoadingProfile()
  } else {
    loadDisplayName()
  }
}, { immediate: true })
