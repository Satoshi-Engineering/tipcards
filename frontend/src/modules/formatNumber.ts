export default (value: number, maximumFractionDigits: number, minimumFractionDigits = 0, roundUp = false, locale: string | undefined = undefined): string => {
  if (roundUp && countDecimals(value) > maximumFractionDigits) {
    value = Math.ceil(value * Math.pow(10, maximumFractionDigits)) / Math.pow(10, maximumFractionDigits)
  }
  return value.toLocaleString(locale, { maximumFractionDigits, minimumFractionDigits })
}

const countDecimals = (value: number) => {
  if (Math.floor(value) === value) {
    return 0
  } 
  return value.toString().split('.')[1].length
}
