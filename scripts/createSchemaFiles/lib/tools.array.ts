export function uniqueArray(array: string[]): string[] {
  return array.filter((item, pos) => {
    return array.indexOf(item) == pos
  })
}
