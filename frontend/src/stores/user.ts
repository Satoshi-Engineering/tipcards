import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export const useUserStore = defineStore('user', () => {
  const key = ref<string>()
  const jwt = ref<string>()
  const isLoggedIn = computed(() => key.value != null)

  const login = (payload: { key: string, jwt: string }) => {
    key.value = payload.key
    jwt.value = payload.jwt
  }
  const logout = () => {
    key.value = undefined
    jwt.value = undefined
  }

  return { isLoggedIn, login, logout }
})
