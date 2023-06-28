import axios from 'axios'

/**
 * @param withdrawId string
 * @throws
 */
export const loadLnurlsFromLnbitsByWithdrawId = async (lnbitsOrigin: string, withdrawId: string): Promise<string[]> => {
  const response = await axios.get(
    `${lnbitsOrigin}/withdraw/csv/${withdrawId}`,
    {
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    },
  )
  return response.data.toLowerCase().match(/,*?((lnurl)([0-9]{1,}[a-z0-9]+){1})/g)
}
