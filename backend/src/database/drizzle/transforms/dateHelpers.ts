export const dateOrNullToUnixTimestamp = (date: Date | null) => {
  if (date == null) {
    return null
  }
  return dateToUnixTimestamp(date)
}

export const dateToUnixTimestamp = (date: Date) => Math.round(date.getTime() / 1000)
