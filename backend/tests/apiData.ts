import hashSha256 from '@backend/services/hashSha256'
import crypto, { randomUUID } from 'crypto'

const generateCardHash = () => { return hashSha256(randomUUID()) }
const generateSetId = () => { return crypto.randomUUID() }

export const cardData = {
  DEFAULT_AMOUNT_IN_SATS: 100,
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
