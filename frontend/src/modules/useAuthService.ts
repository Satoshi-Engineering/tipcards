
import axios, { type AxiosError } from 'axios'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'

import { ErrorCode } from '@shared/data/Errors'

import { useAuthStore } from '@/stores/auth'
import { useModalLoginStore } from '@/stores/modalLogin'
import { TIPCARDS_AUTH_ORIGIN } from '@/constants'

export default () => {
  const { t } = useI18n()

  const { logout } = useAuthStore()

  const modalLoginStore = useModalLoginStore()
  const { showModalLogin, modalLoginUserMessage } = storeToRefs(modalLoginStore)

  const showModalLoginWithErrorMessage = (error: unknown) => {
    logout()
    showModalLogin.value = true
    modalLoginUserMessage.value = t('auth.errors.refreshTokenDefaultError')
    if (!axios.isAxiosError(error) || !isUnauthorizedError(error)) {
      return
    }
    switch (error.response?.data?.code) {
      case ErrorCode.RefreshTokenExpired:
        modalLoginUserMessage.value = t('auth.errors.refreshTokenExpired')
        break
      case ErrorCode.RefreshTokenDenied:
        modalLoginUserMessage.value = t('auth.errors.refreshTokenDenied')
    }
  }

  return {
    get: async (route: string) => {
      try {
        return await axios.get(`${TIPCARDS_AUTH_ORIGIN}/api/auth/${route}`, { withCredentials: true })
      } catch (error) {
        showModalLoginWithErrorMessage(error)
        throw error
      }
    },
    post: async (route: string, data?: unknown) => {
      try {
        return await axios.post(`${TIPCARDS_AUTH_ORIGIN}/api/auth/${route}`, data, { withCredentials: true })
      } catch (error) {
        showModalLoginWithErrorMessage(error)
        throw error
      }
    },
  }
}

const isUnauthorizedError = (error: AxiosError) => error.response?.status === 401
