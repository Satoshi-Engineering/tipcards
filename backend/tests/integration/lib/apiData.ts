import crypto, { randomUUID } from 'crypto'

import { encodeLnurl } from '@shared/modules/lnurlHelpers'
import hashSha256 from '@backend/services/hashSha256'

import { API_ORIGIN } from '../lib/constants'

const generateCardHash = () => { return hashSha256(randomUUID()) }
const generateSetId = () => { return crypto.randomUUID() }

export const cardData = {
  DEFAULT_AMOUNT_IN_SATS: 200,
  generateCardHash,
  generateCard: (amount: number) => {
    const cardHash = generateCardHash()
    return {
      cardHash,
      amount,
      text: `${cardHash} textForWithdraw`,
      note: `${cardHash} noteForStatusPage`,
    }
  },
  generateCardHashForSet: (setId: string, cardIndex = 0) => {
    return hashSha256(`${setId}/${cardIndex}`)
  },
  generateLnurl: (cardHash?: string) => {
    if (cardHash == null) {
      cardHash = cardData.generateCardHash()
    }
    return encodeLnurl(`${API_ORIGIN}/api/lnurl/${cardHash}`)
  },
}

export const setData = {
  generateSetId,
  generateSet: () => {
    const setId = generateSetId()

    return {
      id: setId,
      settings: {
        numberOfCards: 8,
        cardHeadline: `${setId} cardHeadline`,
        cardCopytext: `${setId} cardCopytext`,
        cardsQrCodeLogo: 'bitcoin',
        setName: `${setId} setName`,
        landingPage: 'default',
      },
      date: Math.floor(Date.now() / 1000),
      created: Math.floor(Date.now() / 1000),
      userId: null,
      text: '',
      note: '',
      invoice: null,
    }
  },
}

export const authData = {
  getAuthRefreshTestObject: () => {
    return {
      status: 'success',
      data: {
        accessToken: expect.any(String),
      },
    }
  },
}
