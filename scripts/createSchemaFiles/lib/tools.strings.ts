
export function upperCaseFirst(string: string) {
  return string.charAt(0).toUpperCase() + string.slice(1)
}

export function lowerCaseFirst(string: string) {
  return string.charAt(0).toLowerCase() + string.slice(1)
}

export function fromCamelCaseToUnderScore(string: string) {
  return string.replace(/([a-z][A-Z])/g,  (g) => { return g[0] + '_' + g[1].toLowerCase() }).toLowerCase()
}
