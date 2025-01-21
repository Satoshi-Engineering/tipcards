import { storeToRefs } from 'pinia'
import { computed, ref, watch } from 'vue'
import axios from 'axios'

import { useAuthStore } from '@/stores/auth'
import { BACKEND_API_ORIGIN } from '@/constants'
import type { Image as ImageMeta } from '@shared/data/api/Image'

export type SelectedCardLogo = ImageMeta | 'bitcoin' | 'lightning' | undefined

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

  const getSelectedCardLogo = (setSettingsImage: string | null | undefined): SelectedCardLogo => {
    if (setSettingsImage == null) {
      return undefined
    }
    if (setSettingsImage === 'bitcoin' || setSettingsImage === 'lightning') {
      return setSettingsImage
    }
    return availableCardLogosById.value[setSettingsImage]
  }

  watch(isLoggedIn, loadAvailableCardLogos)

  return {
    availableCardLogos,
    availableCardLogosById,
    loadAvailableCardLogos,
    getSelectedCardLogo,
  }
}
