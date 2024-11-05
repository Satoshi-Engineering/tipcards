import { defineStore, storeToRefs } from 'pinia'
import { computed, nextTick, ref, watch } from 'vue'

import type { ProfileDto } from '@shared/data/trpc/ProfileDto'

import i18n from '@/modules/initI18n'
import useTRpc, { isTRpcClientAbortError } from '@/modules/useTRpc'
import { useAuthStore } from '@/stores/auth'

export const useProfileStore = defineStore('profile', () => {
  // Itried to use `useI18n` instead, but then the unit tests failed to initialize the i18n module
  const { t } = i18n.global

  const authStore = useAuthStore()
  const { isLoggedIn } = storeToRefs(authStore)
  const { profile } = useTRpc()

  ///// public
  const userAccountName = ref<string>()
  const userDisplayName = ref<string>()
  const userEmail = ref<string>()

  const fetching = ref<'profile' | 'displayName' | null>(null)
  const fetchingUserErrorMessages = ref<string[]>([])

  const subscribe = async (): Promise<void> => {
    subscribed.value = true
    const promise = new Promise<void>((resolve, reject) => {
      callbacks.push({ resolve, reject })
    })
    loadProfile()
    return promise
  }

  const unsubscribe = (): void => {
    subscribed.value = false
  }

  const update = async (profileDto: Partial<ProfileDto>): Promise<void> => {
    const signal = await prepareNewRequest('profile')
    try {
      const profileDtoResponse = await profile.update.mutate(profileDto, { signal })
      updateLocalData(profileDtoResponse)
    } catch (error) {
      if (!isTRpcClientAbortError(error)) {
        console.error(error)
        fetchingUserErrorMessages.value.push(t('stores.profile.errors.unableToSaveToBackend'))
      }
    } finally {
      cleanUpAfterRequest()
    }
  }

  ///// private
  const subscribed = ref(false)
  const callbacks: { resolve: CallableFunction, reject: CallableFunction }[] = []
  let abortController: AbortController | null = null

  const loadProfile = async () => {
    if (!isLoggedIn.value) {
      callbacks.forEach(({ resolve }) => resolve())
      return
    }
    if (fetching.value === 'profile') {
      return
    }
    try {
      await queryProfileFromBackend()
      callbacks.forEach(({ resolve }) => resolve())
    } catch {
      callbacks.forEach(({ reject }) => reject())
    } finally {
      callbacks.length = 0
    }
  }

  const queryProfileFromBackend = async () => {
    const signal = await prepareNewRequest('profile')
    try {
      const profileDto = await profile.get.query(undefined, { signal })
      updateLocalData(profileDto)
    } catch (error) {
      if (!isTRpcClientAbortError(error)) {
        console.error(error)
        fetchingUserErrorMessages.value.push(t('stores.profile.errors.unableToLoadFromBackend'))
        throw error
      }
    } finally {
      cleanUpAfterRequest()
    }
  }

  const loadDisplayName = async () => {
    if (fetching.value) {
      return
    }
    const signal = await prepareNewRequest('displayName')
    try {
      userDisplayName.value = await profile.getDisplayName.query(undefined, { signal })
    } catch (error) {
      if (!isTRpcClientAbortError(error)) {
        console.error(error)
      }
      userDisplayName.value = undefined
    } finally {
      cleanUpAfterRequest()
    }
  }

  const cancelCurrentRequest = async () => {
    if (abortController == null) {
      return
    }
    abortController.abort()
    await nextTick()
  }

  const prepareNewRequest = async (requestTarget: 'profile' | 'displayName') => {
    await cancelCurrentRequest()
    fetching.value = requestTarget
    fetchingUserErrorMessages.value = []
    abortController = new AbortController()
    return abortController.signal
  }

  const updateLocalData = (profileDto: Partial<ProfileDto>) => {
    userAccountName.value = profileDto.accountName ?? userAccountName.value
    userDisplayName.value = profileDto.displayName ?? userDisplayName.value
    userEmail.value = profileDto.email ?? userEmail.value
  }

  const cleanUpAfterRequest = () => {
    fetching.value = null
    abortController = null
  }

  watch(isLoggedIn, async () => {
    await cancelCurrentRequest()

    if (!isLoggedIn.value) {
      userAccountName.value = undefined
      userDisplayName.value = undefined
      userEmail.value = undefined
      return
    }

    if (subscribed.value) {
      loadProfile()
    } else {
      loadDisplayName()
    }
  }, { immediate: true })

  return {
    userAccountName: computed(() => userAccountName.value),
    userDisplayName: computed(() => userDisplayName.value),
    userEmail: computed(() => userEmail.value),
    fetching: computed(() => fetching.value != null),
    fetchingUserErrorMessages: computed(() => fetchingUserErrorMessages.value),
    subscribe,
    unsubscribe,
    update,
  }
})
