import { describe, it, expect, vi } from 'vitest'

import { tRpcMock } from '../mocks/modules/useTRpc'
import '../mocks/i18n'
import '../mocks/pinia'
import '../mocks/provide'
import '../mocks/router'

import useProfile from '@/stores/useProfile'

describe('useProfile to update the profile', () => {
  const {
    userAccountName,
    userDisplayName,
    userEmail,
    update,
  } = useProfile()

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

  it.skip('should not update if the request to the backend fails', async () => {
  })
})
