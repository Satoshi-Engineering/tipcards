export function uniqueArray(array: unknown[]): unknown[] {
  return array.filter((item, pos) => {
    return array.indexOf(item) == pos
  })
}
