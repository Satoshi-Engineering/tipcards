import axios from 'axios'

import { LNURL_ORIGIN } from '../constants'

/**
 * @param withdrawId string
 * @throws
 */
export const loadLnurlsFromLnbitsByWithdrawId = async (withdrawId: string): Promise<string[]> => {
  const response = await axios.get(
    `${LNURL_ORIGIN}/withdraw/csv/${withdrawId}`,
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
