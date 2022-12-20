import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export const useUserStore = defineStore('user', () => {
  const key = ref<string>('Eduardo')
  function login(newKey: string) {
    key.value = newKey
  }

  const isLoggedIn = computed(() => key != null)

  return { isLoggedIn, login }
})
