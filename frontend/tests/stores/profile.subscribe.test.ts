import { createPinia, setActivePinia, storeToRefs } from 'pinia'
import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest'

import { tRpcMock } from '../mocks/modules/useTRpc'
import '../mocks/i18n'
import '../mocks/pinia'
import '../mocks/provide'
import '../mocks/router'

import { useAuthStore } from '@/stores/auth'
import { useProfileStore } from '@/stores/profile'

describe('useProfile to subscribe to the full profile', () => {
  const authStore = vi.mocked(useAuthStore())

  setActivePinia(createPinia())
  const profileStore = useProfileStore()
  const {
    userAccountName,
    userDisplayName,
    userEmail,
  } = storeToRefs(profileStore)
  const {
    subscribe,
    unsubscribe,
  } = profileStore

  const originalQuery = tRpcMock.profile.get.query
  const queryProfile = vi.fn(async () => ({
    accountName: 'john_doe',
    displayName: 'John Doe',
    email: 'hello@john.doe',
  }))

  beforeAll(() => {
    tRpcMock.profile.get.query = queryProfile
  })

  afterAll(() => {
    tRpcMock.profile.get.query = originalQuery
  })

  it('should do nothing if the user is logged out', () => {
    subscribe()

    expect(userAccountName.value).toBeUndefined()
    expect(userDisplayName.value).toBeUndefined()
    expect(userEmail.value).toBeUndefined()
    expect(queryProfile).not.toHaveBeenCalled()
  })

  it('should fetch the profile as soon as the user is logged in', async () => {
    authStore.isLoggedIn = true
    await vi.waitFor(() => {
      if (userDisplayName.value == null) {
        throw Error('Waiting for the "fetch" to complete')
      }
    })

    expect(userAccountName.value).toBe('john_doe')
    expect(userDisplayName.value).toBe('John Doe')
    expect(userEmail.value).toBe('hello@john.doe')
    expect(queryProfile).toHaveBeenCalledOnce()
  })

  it('should only fetch the displayName if unsubscribe is called', async () => {
    unsubscribe()
    authStore.isLoggedIn = false
    await vi.waitFor(() => {
      if (userDisplayName.value != null) {
        throw Error('Waiting for resetting')
      }
    })

    authStore.isLoggedIn = true
    await vi.waitFor(() => {
      if (userDisplayName.value == null) {
        throw Error('Waiting for the "fetch" to complete')
      }
    })

    expect(userAccountName.value).toBeUndefined()
    expect(userDisplayName.value).toBeDefined()
    expect(userEmail.value).toBeUndefined()
  })
})
