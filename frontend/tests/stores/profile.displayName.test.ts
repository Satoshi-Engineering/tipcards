import { createPinia, setActivePinia, storeToRefs } from 'pinia'
import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest'

import { tRpcMock } from '../mocks/modules/useTRpc'
import '../mocks/i18n'
import '../mocks/pinia'
import '../mocks/provide'
import '../mocks/router'

import { useAuthStore } from '@/stores/auth'
import { useProfileStore } from '@/stores/profile'

describe('useProfile', () => {
  const authStore = vi.mocked(useAuthStore())

  setActivePinia(createPinia())
  const { userDisplayName } = storeToRefs(useProfileStore())

  const originalQuery = tRpcMock.profile.getDisplayName.query
  const queryDisplayName = vi.fn(async () => 'John Doe')

  beforeAll(() => {
    tRpcMock.profile.getDisplayName.query = queryDisplayName
  })

  afterAll(() => {
    tRpcMock.profile.getDisplayName.query = originalQuery
  })

  it('should do nothing if the user is logged out', () => {
    expect(userDisplayName.value).toBeUndefined()
    expect(queryDisplayName).not.toHaveBeenCalled()
  })

  it('should fetch the displayName when the user is logged in', async () => {
    authStore.isLoggedIn = true
    await vi.waitFor(() => {
      if (userDisplayName.value == null) {
        throw Error('Waiting for the "fetch" to complete')
      }
    })
    expect(userDisplayName.value).toBe('John Doe')
    expect(queryDisplayName).toHaveBeenCalledOnce()
  })

  it('should reset the displayName when the user logs out', async () => {
    authStore.isLoggedIn = false
    await vi.waitFor(() => {
      if (userDisplayName.value != null) {
        throw Error('Waiting for resetting')
      }
    })
    expect(userDisplayName.value).toBeUndefined()
    expect(queryDisplayName).toHaveBeenCalledOnce()
  })
})
