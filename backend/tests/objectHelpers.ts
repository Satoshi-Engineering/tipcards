export const deepCopy = (object: unknown): unknown => {
  return JSON.parse(JSON.stringify(object))
}
