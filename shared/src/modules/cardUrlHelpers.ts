import LNURL from './LNURL/LNURL'

export const getLandingPageLinkForCardHash = (origin: string, cardHash: string): string => {
  const lnurlDecoded = `${origin}/api/lnurl/${cardHash}`
  const lnurlEncoded = LNURL.encode(lnurlDecoded)
  return `${origin}/landing/?lightning=${lnurlEncoded}`
}
