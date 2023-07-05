import axios, { type InternalAxiosRequestConfig } from 'axios'
import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import { BACKEND_API_ORIGIN } from '@/constants'
import { ErrorCode } from '@root/data/Errors'

const REFRESH_ROUTE = `${BACKEND_API_ORIGIN}/api/auth/refresh`
const STATUS_ROUTE_PREFIX = `${BACKEND_API_ORIGIN}/api/auth/status`

export const useUserStore = defineStore('user', () => {
  const { t } = useI18n()

  const accessToken = ref<string | undefined | null>(undefined)
  const isLoggedIn = computed(() => {
    if (accessToken.value === undefined) {
      return undefined
    }
    return accessToken.value != null
  })
  const showModalLogin = ref(false)
  const modalLoginUserMessage = ref<string | null>()

  watch(showModalLogin, (newVal, oldVal) => {
    if (oldVal === true && newVal === false) {
      modalLoginUserMessage.value = null
    }
  })

  const userId = computed(() => {
    if (accessToken.value == null) {
      return undefined
    }
    try {
      const payload = JSON.parse(atob(accessToken.value.split('.')[1]))
      return payload.id
    } catch (error) {
      console.error(error)
    }
    return undefined
  })

  const lnurlAuthKey = computed(() => {
    if (accessToken.value == null) {
      return undefined
    }
    try {
      const payload = JSON.parse(atob(accessToken.value.split('.')[1]))
      return payload.lnurlAuthKey
    } catch (error) {
      console.error(error)
    }
    return undefined
  })

  const login = async (hash: string) => {
    try {
      const response = await axios.get(`${STATUS_ROUTE_PREFIX}/${hash}`)
      if (typeof response.data.data?.accessToken === 'string') {
        accessToken.value = response.data.data.accessToken
      }
    } catch (error) {
      console.error(error)
    }
  }

  const logout = async () => {
    accessToken.value = null
    try {
      await axios.post(`${BACKEND_API_ORIGIN}/api/auth/logout`)
    } catch (error) {
      console.error(error)
    }
  }

  let refreshingAccessToken = false
  const refreshCallbacks: { resolve: CallableFunction, reject: CallableFunction }[] = []
  const refreshAccessToken = async () => {
    if (refreshingAccessToken) {
      const promise = new Promise((resolve, reject) => {
        refreshCallbacks.push({ resolve, reject })
      })
      return promise
    }
    refreshingAccessToken = true
    try {
      const response = await axios.get(REFRESH_ROUTE)
      if (typeof response.data.data?.accessToken === 'string') {
        accessToken.value = response.data.data.accessToken
      } else {
        accessToken.value = undefined
      }
      refreshCallbacks.forEach(({ resolve }) => resolve(response))
      return response
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        switch (error.response?.data?.code) {
          case ErrorCode.RefreshTokenExpired:
            modalLoginUserMessage.value = t('auth.errors.refreshTokenExpired')
            showModalLogin.value = true
            break
          case ErrorCode.RefreshTokenDenied:
            modalLoginUserMessage.value = t('auth.errors.refreshTokenDenied')
            showModalLogin.value = true
            break
          default:
            if (accessToken.value != null) {
              showModalLogin.value = true
              modalLoginUserMessage.value = t('auth.errors.refreshTokenDefaultError')
            } else {
              // initial check - user remains logged out
            }
        }
        accessToken.value = null
      } else {
        accessToken.value = undefined
      }
      refreshCallbacks.forEach(({ reject }) => reject(error))
      throw error
    } finally {
      refreshCallbacks.length = 0
      refreshingAccessToken = false
    }
  }
  (async () => {
    try {
      await refreshAccessToken()
    } catch (error) {
      // initial check - user remains logged out
    }
  })()

  axios.interceptors.request.use(async (config) => {
    if (config.url === REFRESH_ROUTE || config.url?.startsWith(STATUS_ROUTE_PREFIX)) {
      return config
    }
    if (
      accessToken.value === null
      || config.url == null
      || config.url.indexOf(BACKEND_API_ORIGIN) < 0
    ) {
      return config
    }
    if (accessToken.value === undefined) {
      try {
        await refreshAccessToken()
      } catch (error) {
        return config
      }
    }
    if (accessToken.value == null) {
      return config
    }

    try {
      const payload = JSON.parse(atob(accessToken.value.split('.')[1]))
      if (payload.exp < + new Date() / 1000) {
        await refreshAccessToken()
      }
    } catch (error) {
      return config
    }
    if (accessToken.value == null) {
      return config
    }

    return {
      ...config,
      headers: {
        ...config.headers,
        Authorization: accessToken.value,
      },
    } as InternalAxiosRequestConfig<any>
  })

  axios.interceptors.response.use(undefined, async (error) => {
    if (
      error.config?.url == null
      || error.config.meta?.isRetry === true
      || error.config.url === REFRESH_ROUTE
      || error.config.url.indexOf(BACKEND_API_ORIGIN) < 0
      || error.response.status !== 401
    ) {
      throw error
    }
    await refreshAccessToken()
    return await axios.create()({
      ...error.config,
      meta: {
        isRetry: true,
      },
      headers: {
        ...error.config.headers,
        Authorization: accessToken.value,
      },
    })
  })

  return { isLoggedIn, showModalLogin, modalLoginUserMessage, userId, lnurlAuthKey, accessToken, login, logout }
})
