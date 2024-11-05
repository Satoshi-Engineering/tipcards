import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'

import { ErrorCode } from '@shared/data/Errors'

import ErrorUnauthorized from '@/errors/ErrorUnauthorized'
import { useAuthStore } from '@/stores/auth'
import { useModalLoginStore } from '@/stores/modalLogin'

export default () => {
  const { t } = useI18n()
  const authStore = useAuthStore()
  const { isLoggedIn } = storeToRefs(authStore)
  const modalLoginStore = useModalLoginStore()
  const { showModalLogin, modalLoginUserMessage } = storeToRefs(modalLoginStore)

  const initAuth = async () => {
    getValidAccessToken()
  }

  const getValidAccessToken = async (): Promise<string | null> => {
    const isInitialCheck = isLoggedIn.value === undefined
    let accessToken: string | null = null
    try {
      accessToken = await authStore.getValidAccessToken()
    } catch (error) {
      if (error instanceof ErrorUnauthorized) {
        handleUnauthorizedError(error, isInitialCheck)
      } else {
        console.error(error)
      }
    }

    return accessToken
  }

  const logoutAllOtherDevices = async () => {
    try {
      await authStore.logoutAllOtherDevices()
    } catch (error) {
      if (error instanceof ErrorUnauthorized) {
        handleUnauthorizedError(error)
      } else {
        console.error(error)
        throw error
      }
    }
  }

  const handleUnauthorizedError = (error: ErrorUnauthorized, isInitialCheck = false) => {
    if (error.code === ErrorCode.RefreshTokenExpired) {
      modalLoginUserMessage.value = t('auth.errors.refreshTokenExpired')
      showModalLogin.value = true
    } else if (error.code === ErrorCode.RefreshTokenDenied) {
      modalLoginUserMessage.value = t('auth.errors.refreshTokenDenied')
      showModalLogin.value = true
    } else {
      modalLoginUserMessage.value = t('auth.errors.refreshTokenDefaultError')
      showModalLogin.value = !isInitialCheck
    }
  }

  return {
    initAuth,
    getValidAccessToken,
    logoutAllOtherDevices,
  }
}
