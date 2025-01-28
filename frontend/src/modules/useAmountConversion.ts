import { type Ref, computed } from 'vue'
import formatNumber from './formatNumber'

export type SelectedCurrency = 'sats' | 'BTC' | 'fiat'

export const useAmountConversion = ({
  selectedCurrency,
  fiatCurrency,
  rateBtcFiat,
}: {
  selectedCurrency: Ref<SelectedCurrency>,
  fiatCurrency: Ref<string>,
  rateBtcFiat: Ref<number | undefined> | undefined,
}) => {
  const rateBtcSats = 100 * 1000 * 1000

  const selectedCurrencyDisplay = computed(() => selectedCurrency.value === 'fiat' ? fiatCurrency.value : selectedCurrency.value)

  const secondaryCurrency = computed<SelectedCurrency>(() => {
    if (selectedCurrency.value === 'fiat') {
      return 'BTC'
    }
    if (rateBtcFiat?.value != null && rateBtcFiat.value > 0) {
      return 'fiat'
    }
    return selectedCurrency.value === 'sats' ? 'BTC' : 'sats'
  })

  const secondaryCurrencyDisplay = computed(() => secondaryCurrency.value === 'fiat' ? fiatCurrency.value : secondaryCurrency.value)

  const satsToFiat = (sats: number, locale?: string) => {
    if (rateBtcFiat?.value == null || rateBtcFiat.value <= 0) {
      return ''
    }
    return formatNumber(sats / rateBtcSats * rateBtcFiat.value, 2, 2, true, locale)
  }

  const satsToBtc = (sats: number, locale?: string) => formatNumber(sats / rateBtcSats, 8, 8, undefined, locale)

  const satsToPrimary = (sats: number, locale?: string): string => {
    if (selectedCurrency.value === 'fiat') {
      return satsToFiat(sats, locale)
    }
    if (selectedCurrency.value === 'BTC') {
      return satsToBtc(sats, locale)
    }
    return String(sats)
  }

  const satsToSecondary = (sats: number): string => {
    if (secondaryCurrency.value === 'fiat') {
      return satsToFiat(sats)
    }
    if (secondaryCurrency.value === 'BTC') {
      return satsToBtc(sats)
    }
    return String(sats)
  }

  return {
    selectedCurrencyDisplay,
    secondaryCurrencyDisplay,
    satsToPrimary,
    satsToSecondary,
  }
}
