import axios from 'axios'
import { ref, computed } from 'vue'

export const rateBtcFiat = ref<Record<string, number> | undefined>()

/**
 * @deprecated Use rateBtcFiat instead
 */
export const rateBtcEur = computed(() => rateBtcFiat.value?.EUR)

export const loadRateBtcFiat = async () => {
  const response = await axios.get('https://api.kraken.com/0/public/Ticker?pair=BTCEUR,BTCUSD')
  rateBtcFiat.value = {
    EUR: parseFloat(response.data.result.XXBTZEUR.c[0]),
    USD: parseFloat(response.data.result.XXBTZUSD.c[0]),
  }
}
loadRateBtcFiat()
