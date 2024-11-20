import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

import { AccessTokenPayload } from '@shared/data/auth'
import { authErrorCodes, ErrorWithCode } from '@shared/data/Errors'

import ErrorUnauthorized from '@/errors/ErrorUnauthorized'
import useTRpcAuth, { asTRrpcClientError } from '@/modules/useTRpcAuth'

export const useAuthStore = defineStore('auth', () => ({
  userId,
  isLoggedIn,
  accessTokenPayload,
  login,
  logout,
  logoutAllOtherDevices,
  getValidAccessToken,
}))

const trpcAuth = useTRpcAuth()

/**
 * If accessToken is null the user is currently not authorized (i.e. logged out).
 * If it is undefined the status has not been confirmed yet - we need to call the refresh route of the auth service to confirm the status.
 */
const accessToken = ref<string | undefined | null>(undefined)

const isLoggedIn = computed(() => {
  if (accessToken.value === undefined) {
    return undefined
  }
  return accessToken.value != null
})

const accessTokenPayload = computed(() => {
  if (accessToken.value == null) {
    return null
  }
  try {
    const payload = JSON.parse(atob(accessToken.value.split('.')[1]))
    return AccessTokenPayload.parse(payload)
  } catch (error) {
    console.error(error)
  }
  return null
})

const userId = computed(() => accessTokenPayload.value?.userId)

const callbacksAwaitingAccessToken = ref<CallableFunction[]>([])
const fetchingAccessToken = ref(false)

/**
 * @throws ErrorUnauthorized
 * @throws AxiosError
 */
const login = async (hash: string) => {
  if (fetchingAccessToken.value) {
    return awaitNewAccessToken()
  }

  fetchingAccessToken.value = true
  try {
    const loginResponse = await trpcAuth.auth.loginWithLnurlAuthHash.query({
      hash,
    })
    accessToken.value = loginResponse.accessToken
    return accessToken.value
  } catch (error) {
    throw resetAccessTokenDependingOnError(error)
  } finally {
    callbacksAwaitingAccessToken.value.forEach((resolve) => resolve(accessToken.value))
    callbacksAwaitingAccessToken.value = []
    fetchingAccessToken.value = false
  }
}

/**
 * @throws
 */
const logoutAllOtherDevices = async () => {
  try {
    const result = await trpcAuth.auth.logoutAllOtherDevices.query()
    accessToken.value = result.accessToken
  } catch (error) {
    throw resetAccessTokenDependingOnError(error)
  }
}

/**
 * @throws
 */
const logout = async () => {
  accessToken.value = null
  try {
    await trpcAuth.auth.logout.query()
  } catch (error) {
    console.error(error)
  }
}

const accessTokenNeedsRefresh = () => {
  if (accessToken.value === null) {
    return false
  }
  if (accessToken.value === undefined) {
    return true
  }
  return isAccessTokenExpired()
}

const isAccessTokenExpired = () => {
  if (accessToken.value == null) {
    return true
  }
  try {
    const payload = JSON.parse(atob(accessToken.value.split('.')[1]))
    const oneMinuteBeforeExpiration = payload.exp - 60
    const nowInSeconds = + new Date() / 1000
    return nowInSeconds > oneMinuteBeforeExpiration
  } catch {
    return true
  }
}

/**
 * @throws ErrorUnauthorized
 * @throws AxiosError
 */
const getValidAccessToken = async (): Promise<string | null> => {
  if (!accessTokenNeedsRefresh()) {
    return accessToken.value || null
  }

  return refreshAccessToken()
}

/**
 * @throws ErrorUnauthorized
 * @throws AxiosError
 */
const refreshAccessToken = async (): Promise<string | null> => {
  if (fetchingAccessToken.value) {
    return awaitNewAccessToken()
  }
  return getNewAccessToken()
}

/**
 * @throws ErrorUnauthorized
 * @throws AxiosError
 */
const getNewAccessToken = async (): Promise<string | null> => {
  fetchingAccessToken.value = true
  try {
    const refreshTokenResponse = await trpcAuth.auth.refreshRefreshToken.query()
    accessToken.value = refreshTokenResponse.accessToken
    return accessToken.value || null
  } catch (error) {
    throw resetAccessTokenDependingOnError(error)
  } finally {
    callbacksAwaitingAccessToken.value.forEach((resolve) => resolve(accessToken.value))
    callbacksAwaitingAccessToken.value = []
    fetchingAccessToken.value = false
  }
}

const awaitNewAccessToken = () => new Promise<string | null>((resolve) => {
  callbacksAwaitingAccessToken.value.push(resolve)
})

const resetAccessTokenDependingOnError = (error: unknown): never => {
  const trpcError = asTRrpcClientError(error)

  if (trpcError === undefined) {
    throw error
  }

  if (trpcError.data?.httpStatus !== 401) {
    throw error
  }

  const errorWithCode = ErrorWithCode.fromTrpcMessage(trpcError.message)
  if (!authErrorCodes.includes(errorWithCode.code)) {
    throw error
  }

  accessToken.value = null
  throw new ErrorUnauthorized(errorWithCode.code)
}
