import { storeToRefs } from 'pinia'

import ErrorUnauthorized from '@/errors/ErrorUnauthorized'
import { useAuthStore } from '@/stores/auth'
import { useModalLoginStore } from '@/stores/modalLogin'

const initAuth = async () => {
  const authStore = useAuthStore()
  const { getValidAccessToken } = authStore
  
  const modalLoginStore = useModalLoginStore()
  const { showModalLogin, modalLoginUserMessage } = storeToRefs(modalLoginStore)

  try {
    await getValidAccessToken()
  } catch (error) {
    if (error instanceof ErrorUnauthorized) {
      modalLoginUserMessage.value = error.message
      showModalLogin.value = true
    } else {
      console.error(error)
    }
  }
}
export default initAuth
