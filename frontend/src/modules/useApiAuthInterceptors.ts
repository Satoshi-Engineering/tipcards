import axios, { type InternalAxiosRequestConfig } from 'axios'

import useAuth from '@/modules/useAuth'
import { BACKEND_API_ORIGIN } from '@/constants'

export default () => {
  const { getValidAccessTokenWithUnauthorizedHandling } = useAuth()

  const initApiAuthInterceptors = () => {
    axios.interceptors.request.use(async (config) => {
      if (config.url == null || config.url.indexOf(BACKEND_API_ORIGIN) < 0) {
        return config
      }

      const accessToken = await getValidAccessTokenWithUnauthorizedHandling()
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
  }

  return { initApiAuthInterceptors }
}
