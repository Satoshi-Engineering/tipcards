import { randomUUID } from 'node:crypto'

import type { Set } from '@shared/data/api/Set'
import { encodeCardsSetSettings } from '@/stores/cardsSets'

export const createSet = (): Set => {
  const date = Math.floor(+ new Date() / 1000)
  return {
    id: randomUUID(),
    settings: null,
    date,
    created: date,
    userId: null,
    text: '',
    note: '',
    invoice: null,
  }
}

export const createLocalStorageSet = () => {
  const set = createSet()
  return {
    setId: set.id,
    settings: encodeCardsSetSettings(set.settings),
    created: new Date(set.created * 1000).toISOString(),
    date: new Date(set.created * 1000).toISOString(),
  }
}
