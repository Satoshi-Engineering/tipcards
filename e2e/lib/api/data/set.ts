// import * as crypto from 'crypto'

import { Set } from '@shared/data/api/Set'

export const generateSetId = () => crypto.randomUUID()

export const generateSet = ({
  name,
  userId,
  created = Math.floor(Date.now() / 1000),
  numberOfCards = 8,
}: {
  name?: string,
  userId?: string,
  created?: number,
  numberOfCards?: number,
} = {}): Set => {
  const setId = generateSetId()

  if (!name) {
    name = `${setId} setName`
  }

  return {
    id: setId,
    settings: {
      numberOfCards,
      cardHeadline: `${setId} cardHeadline`,
      cardCopytext: `${setId} cardCopytext`,
      cardsQrCodeLogo: 'bitcoin',
      setName: name,
      landingPage: 'default',
    },
    date: Math.floor(Date.now() / 1000),
    created,
    userId,
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
