export const dateOrNullToUnixTimestamp = (date: Date | null): number | null => {
  if (date == null) {
    return null
  }
  return dateToUnixTimestamp(date)
}

export const dateToUnixTimestamp = (date: Date): number => Math.round(date.getTime() / 1000)

export const unixTimestampOrNullToDate = (timestamp: number | null): Date | null => {
  if (timestamp == null) {
    return null
  }
  return unixTimestampToDate(timestamp)
}

export const unixTimestampToDate = (timestamp: number): Date => new Date(timestamp * 1000)
