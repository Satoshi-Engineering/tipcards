import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export const useUserStore = defineStore('user', () => {
  const key = ref<string>()
  const isLoggedIn = computed(() => key.value != null)

  const login = (newKey: string) => {
    key.value = newKey
  }
  const logout = () => {
    key.value = undefined
  }

  return { isLoggedIn, login, logout }
})
