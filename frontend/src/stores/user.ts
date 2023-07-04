import axios, { type InternalAxiosRequestConfig } from 'axios'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

import { BACKEND_API_ORIGIN } from '@/constants'

const REFRESH_ROUTE = `${BACKEND_API_ORIGIN}/api/auth/refresh`
const STATUS_ROUTE_PREFIX = `${BACKEND_API_ORIGIN}/api/auth/status`

export const useUserStore = defineStore('user', () => {
  const accessToken = ref<string | undefined | null>(undefined)
  const isLoggedIn = computed(() => {
    if (accessToken.value === undefined) {
      return undefined
    }
    return accessToken.value != null
  })

  const id = computed(() => {
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

  const refreshAccessToken = async () => {
    try {
      const response = await axios.get(REFRESH_ROUTE)
      if (typeof response.data.data?.accessToken === 'string') {
        accessToken.value = response.data.data.accessToken
      } else {
        accessToken.value = undefined
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        accessToken.value = null
      } else {
        accessToken.value = undefined
      }
    }
  }
  refreshAccessToken()

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
      await refreshAccessToken()
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

    return {
      ...config,
      headers: {
        ...config.headers,
        Authorization: accessToken.value,
      },
    } as InternalAxiosRequestConfig<any>
  })

  axios.interceptors.response.use(undefined, (error) => {
    if (error.config?.url == null || error.config.url.indexOf(BACKEND_API_ORIGIN) < 0) {
      return Promise.reject(error)
    }
    if (error.response.status === 401) {
      logout()
    }
    return Promise.reject(error)
  })

  return { isLoggedIn, id, lnurlAuthKey, accessToken, login, logout }
})
