import { ref, watch } from 'vue'

export default (delay = 500, loadingAnimationOnReload = false) => {
  const loading = ref<boolean>()
  const showLoadingAnimation = ref<boolean>(false)
  const showContent = ref<boolean>(true)
  let timeout: ReturnType<typeof setTimeout>

  watch(loading, (newValue, oldValue) => {
    if (timeout != null) {
      clearTimeout(timeout)
    }
    if (newValue === false) {
      showLoadingAnimation.value = false
      showContent.value = true
      return
    }
    if (oldValue === true) {
      return
    }
    if (oldValue == null || loadingAnimationOnReload) {
      showContent.value = false
      timeout = setTimeout(() => {
        showLoadingAnimation.value = true
      }, oldValue == null ? delay : 0)
    }
  })

  return { loading, showLoadingAnimation, showContent }
}
