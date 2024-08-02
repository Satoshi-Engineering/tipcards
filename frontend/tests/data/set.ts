import { randomUUID } from 'node:crypto'

import type { Set } from '@shared/data/api/Set'
import { encodeCardsSetSettings } from '@/stores/cardsSets'

export const createSet = (options: Partial<Set> = {}): Set => {
  const date = Math.floor(+ new Date() / 1000)
  return {
    id: options.id || randomUUID(),
    settings: options.settings || null,
    date: options.date || date,
    created: options.created || date,
    userId: options.userId || null,
    text: options.text || '',
    note: options.note || '',
    invoice: options.invoice || null,
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
