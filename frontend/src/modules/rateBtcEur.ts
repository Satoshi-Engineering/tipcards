import axios from 'axios'
import { ref } from 'vue'

export const rateBtcEur = ref<number | undefined>()

export const loadRateBtcEur = async () => {
  const response = await axios.get('https://api.kraken.com/0/public/Ticker?pair=BTCEUR')
  rateBtcEur.value = parseFloat(response.data.result.XXBTZEUR.c[0])
}
loadRateBtcEur()
