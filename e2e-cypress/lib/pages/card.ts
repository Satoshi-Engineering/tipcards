import { TIPCARDS_ORIGIN } from '@e2e/lib/constants'

import { gotoPage } from './utils'
import { sha256 } from '@e2e/lib/cryptoHelpers'

const CARD_PAGE_BASE_URL = new URL('/card', TIPCARDS_ORIGIN)

export const goto = (cardHash: string) => {
  gotoPage(new URL(`${CARD_PAGE_BASE_URL.href}/${cardHash}`))
}

export const getCardHashFromSet = (setId: string, cardIndex: number) => sha256(`${setId}/${cardIndex}`)
