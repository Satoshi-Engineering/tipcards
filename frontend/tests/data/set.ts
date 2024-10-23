import { randomUUID } from 'node:crypto'

import type { Set as SetDeprecated } from '@shared/data/api/Set'
import { SetDto } from '@shared/data/trpc/SetDto'
import { encodeCardsSetSettings } from '@/stores/cardsSets'

export const createSetDeprecated = (options: Partial<SetDeprecated> = {}): SetDeprecated => {
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
  const set = createSetDeprecated()
  return {
    setId: set.id,
    settings: encodeCardsSetSettings(set.settings),
    created: new Date(set.created * 1000).toISOString(),
    date: new Date(set.created * 1000).toISOString(),
  }
}

type RecursivePartial<T> = {
  [P in keyof T]?: RecursivePartial<T[P]>;
}

export const createSet = (options: RecursivePartial<SetDto> = {}): SetDto => {
  const date = new Date()
  return SetDto.parse({
    id: options.id || randomUUID(),
    changed: options.changed || date,
    created: options.created || date,
    settings: options.settings,
  })
}
