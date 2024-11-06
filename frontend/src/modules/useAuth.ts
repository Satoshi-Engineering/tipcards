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
    getValidAccessTokenWithUnauthorizedHandling()
  }

  const getValidAccessTokenWithUnauthorizedHandling = async (): Promise<string | null> => {
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

  const logoutAllOtherDevicesWithUnauthorizedHandling = async () => {
    try {
      await authStore.logoutAllOtherDevices()
    } catch (error) {
      if (error instanceof ErrorUnauthorized) {
        handleUnauthorizedError(error)
      } else {
        throw error
      }
    }
  }

  const handleUnauthorizedError = (error: ErrorUnauthorized, isInitialCheck = false) => {
    if (isInitialCheck && error.code === ErrorCode.RefreshTokenMissing) {
      return
    }
    showModalLogin.value = true

    if (error.code === ErrorCode.RefreshTokenExpired) {
      modalLoginUserMessage.value = t('auth.errors.refreshTokenExpired')
    } else if (error.code === ErrorCode.RefreshTokenDenied) {
      modalLoginUserMessage.value = t('auth.errors.refreshTokenDenied')
    } else {
      modalLoginUserMessage.value = t('auth.errors.refreshTokenDefaultError')
    }
  }

  return {
    initAuth,
    getValidAccessTokenWithUnauthorizedHandling,
    logoutAllOtherDevicesWithUnauthorizedHandling,
  }
}
