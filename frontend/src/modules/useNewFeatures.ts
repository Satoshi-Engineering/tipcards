import { ref } from 'vue'
import { useRoute } from 'vue-router'

export const FEATURE_AUTH = 'auth'

export default () => {
  const route = useRoute()

  const features = ref<string[]>([])
  if (typeof route.query.features === 'string') {
    features.value = route.query.features
      .split(',')
      .map((value) => value.trim())
      .filter((value) => value.length > 0)
  }

  return {
    features,
  }
}
