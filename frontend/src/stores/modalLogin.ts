import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export const useModalLoginStore = defineStore('modalLogin', () => {
  const showModalLogin = ref(false)
  const modalLoginUserMessage = ref<string | null>()

  watch(showModalLogin, (newVal, oldVal) => {
    if (oldVal === true && newVal === false) {
      modalLoginUserMessage.value = null
    }
  })

  return { showModalLogin, modalLoginUserMessage }
})
