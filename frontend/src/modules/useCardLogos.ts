import { storeToRefs } from 'pinia'
import { computed, ref, watch } from 'vue'
import axios from 'axios'

import { useAuthStore } from '@/stores/auth'
import { BACKEND_API_ORIGIN } from '@/constants'
import type { Image as ImageMeta } from '@shared/data/api/Image'

export default () => {
  const { isLoggedIn } = storeToRefs(useAuthStore())

  const availableCardLogos = ref<ImageMeta[]>([])
  const loadAvailableCardLogos = async () => {
    if (!isLoggedIn.value) {
      availableCardLogos.value = []
      return
    }
    const response = await axios.get(`${BACKEND_API_ORIGIN}/api/cardLogos/`)
    availableCardLogos.value = response.data.data
  }
  const availableCardLogosById = computed<Record<string, ImageMeta>>(() => availableCardLogos.value.reduce((byId, image) => ({
    ...byId,
    [image.id]: image,
  }), {}))

  watch(isLoggedIn, loadAvailableCardLogos)

  return {
    availableCardLogos,
    availableCardLogosById,
    loadAvailableCardLogos,
  }
}
