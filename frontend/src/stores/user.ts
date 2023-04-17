import axios from 'axios'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

import { BACKEND_API_ORIGIN } from '@/constants'

const TIPCARDS_AUTH_USER = 'tipcardsAuthUser'

export const useUserStore = defineStore('user', () => {
  const jwt = ref<string>()
  const jwtCookie = document.cookie
    .split(';')
    .map((cookie) => cookie.trim().split('='))
    .find((cookie) => cookie[0] === TIPCARDS_AUTH_USER)
  if (jwtCookie != null) {
    jwt.value = jwtCookie[1]
  }

  const isLoggedIn = computed(() => jwt.value != null)

  const id = computed(() => {
    if (jwt.value == null) {
      return undefined
    }
    try {
      const payload = JSON.parse(atob(jwt.value.split('.')[1]))
      return payload.id
    } catch (error) {
      console.error(error)
    }
    return undefined
  })

  const lnurlAuthKey = computed(() => {
    if (jwt.value == null) {
      return undefined
    }
    try {
      const payload = JSON.parse(atob(jwt.value.split('.')[1]))
      return payload.lnurlAuthKey
    } catch (error) {
      console.error(error)
    }
    return undefined
  })

  const login = (payload: { jwt: string }) => {
    jwt.value = payload.jwt

    document.cookie = `${TIPCARDS_AUTH_USER}=${jwt.value};max-age=${60 * 60 * 24};secure`
  }

  const logout = () => {
    jwt.value = undefined

    document.cookie = `${TIPCARDS_AUTH_USER}=;max-age=0;secure`
  }

  axios.interceptors.request.use((config) => {
    if (
      jwt.value == null
      || config.url == null
      || config.url.indexOf(BACKEND_API_ORIGIN) < 0
    ) {
      return config
    }
    return {
      ...config,
      headers: {
        ...config.headers,
        Authorization: jwt.value,
      },
    }
  })

  axios.interceptors.response.use(undefined, (error) => {
    if (error.config.url == null || error.config.url.indexOf(BACKEND_API_ORIGIN) < 0) {
      return Promise.reject(error)
    }
    if (error.response.status === 401) {
      logout()
    }
    return Promise.reject(error)
  })

  return { isLoggedIn, id, lnurlAuthKey, login, logout }
})
