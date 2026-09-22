const TIPCARDS_ORIGIN = process.env.TIPCARDS_ORIGIN
if (!TIPCARDS_ORIGIN) {
  throw new Error('TIPCARDS_ORIGIN is not set')
}

export const urlWithOptionalTrailingSlash = (path: string) => {
  let urlWithoutTrailingSlash = new URL(path, TIPCARDS_ORIGIN).href
  while (urlWithoutTrailingSlash.endsWith('/')) {
    urlWithoutTrailingSlash = urlWithoutTrailingSlash.slice(0, -1)
  }
  return new RegExp(`${urlWithoutTrailingSlash}(/)?$`)
}
