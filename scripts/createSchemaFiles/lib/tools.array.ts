export function uniqueArray(array: string[]): string[] {
  return array.filter((item, pos) => {
    return array.indexOf(item) == pos
  })
}

export function removeByValue(array: string[], value: string) {
  for (let i = 0; i < array.length; i++) {
    if (array[i] === value) {
      array.splice(i, 1)
      i--
    }
  }

  return array
}
