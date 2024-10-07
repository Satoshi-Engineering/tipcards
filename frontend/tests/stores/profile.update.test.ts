import { createPinia, setActivePinia, storeToRefs } from 'pinia'
import { describe, it, expect, vi } from 'vitest'
import { nextTick } from 'vue'

import { tRpcMock } from '../mocks/modules/useTRpc'
import '../mocks/i18n'
import '../mocks/pinia'
import '../mocks/provide'
import '../mocks/router'

import { useProfileStore } from '@/stores/profile'

describe('useProfile to update the profile', () => {
  setActivePinia(createPinia())
  const profileStore = useProfileStore()
  const {
    userAccountName,
    userDisplayName,
    userEmail,
  } = storeToRefs(profileStore)
  const { update } = profileStore

  it('should update the profile', async () => {
    await update({
      accountName: 'john_doe',
      displayName: 'John Doe',
      email: 'hello@john.doe',
    })
    await vi.waitFor(() => {
      if (userDisplayName.value == null) {
        throw Error('Waiting for the "fetch" to complete')
      }
    })
    expect(userAccountName.value).toBe('john_doe')
    expect(userDisplayName.value).toBe('John Doe')
    expect(userEmail.value).toBe('hello@john.doe')
    expect(tRpcMock.profile.update.mutate).toHaveBeenCalledOnce()
  })

  it('should not update if the request to the backend fails', async () => {
    console.error = vi.fn()
    tRpcMock.profile.update.mutate.mockRejectedValueOnce(new Error('Failed'))
    await update({
      accountName: 'jane_doe',
      displayName: 'Jane Doe',
      email: 'hello@jane.doe',
    })
    await nextTick()
    expect(userAccountName.value).toBe('john_doe')
    expect(userDisplayName.value).toBe('John Doe')
    expect(userEmail.value).toBe('hello@john.doe')
    expect(tRpcMock.profile.update.mutate).toHaveBeenCalledTimes(2)
  })
})
