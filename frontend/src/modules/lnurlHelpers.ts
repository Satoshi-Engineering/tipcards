import LNURL from '@shared/modules/LNURL/LNURL'

export const cardHashFromLnurl = (lnurl: string): string | null => {
  let decodedLnurl: string
  try {
    decodedLnurl = LNURL.decode(lnurl)
  } catch {
    return null
  }
  const [, cardHash] = decodedLnurl.toLowerCase().match(/\/api\/lnurl\/([0-9a-f]+)/) || [undefined, null]
  return cardHash
}
