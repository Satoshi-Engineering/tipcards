export const urlWithOptionalTrailingSlash = (url: URL) => {
  let urlWithoutTrailingSlash = `${url}`
  while (urlWithoutTrailingSlash.slice(-1) === '/') {
    urlWithoutTrailingSlash = urlWithoutTrailingSlash.slice(0, -1)
  }
  return new RegExp(`${urlWithoutTrailingSlash}(\\/)?$`)
}
