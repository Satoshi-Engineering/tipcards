import axios, { type InternalAxiosRequestConfig } from 'axios'

import { useAuthStore } from '@/stores/auth'
import { BACKEND_API_ORIGIN, TIPCARDS_AUTH_ORIGIN } from '@/constants'

const initApiAuthInterceptors = () => {
  const { getValidAccessToken } = useAuthStore()

  axios.interceptors.request.use(async (config) => {
    if (config.url == null || config.url.indexOf(TIPCARDS_AUTH_ORIGIN) < 0) {
      return config
    }
    return {
      ...config,
      withCredentials: true,
    }
  })

  axios.interceptors.request.use(async (config) => {
    if (config.url == null || config.url.indexOf(BACKEND_API_ORIGIN) < 0) {
      return config
    }
  
    let accessToken: string | null
    try {
      accessToken = await getValidAccessToken()
    } catch (error) {
      return config
    }
    if (accessToken == null) {
      return config
    }
  
    return {
      ...config,
      headers: {
        ...config.headers,
        Authorization: accessToken,
      },
    } as InternalAxiosRequestConfig<unknown>
  })
  
  // retry request on 401
  axios.interceptors.response.use(undefined, async (error) => {
    if (
      error.config?.url == null
      || error.config.meta?.isRetry === true
      || error.config.url.indexOf(BACKEND_API_ORIGIN) < 0
      || error.response?.status !== 401
    ) {
      throw error
    }
    const accessToken = await getValidAccessToken(true)
    return await axios.create()({
      ...error.config,
      meta: {
        isRetry: true,
      },
      headers: {
        ...error.config.headers,
        Authorization: accessToken || '',
      },
    })
  })
}
export default initApiAuthInterceptors
