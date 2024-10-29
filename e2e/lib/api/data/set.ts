// import * as crypto from 'crypto'

import { Set } from '@shared/data/api/Set'

export const generateSetId = () => crypto.randomUUID()

export const generateSet = (): Set => {
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
}

export const generateSets = (numberOfSets: number, numberOfCards: number = 8) => {
  return [...new Array(numberOfSets).keys()].map((i) => {
    const set = generateSet()
    set.settings.setName = `Set ${i.toString().padStart(3, '0')}`
    set.settings.numberOfCards = numberOfCards
    return set
  })
}
