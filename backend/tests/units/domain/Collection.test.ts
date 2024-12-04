import { describe, it, expect } from 'vitest'

import '../mocks/process.env.js'

import Collection from '@backend/domain/Collection.js'

describe('Collection', () => {
  it('should filter and sort a list', async () => {
    const collection = new Collection<string>(['cardHash3', 'cardHash2', 'cardHash1'])
    collection.filter = (value: string) => !value.includes('2')
    collection.sort = (a: string, b: string) => a.localeCompare(b)

    expect(collection.filteredAndSorted).toEqual(['cardHash1', 'cardHash3'])
    expect(collection.paginated).toEqual(['cardHash1', 'cardHash3'])
  })

  it('should handle pagination', async () => {
    const collection = new Collection<string>(['cardHash3', 'cardHash2', 'cardHash1'])
    collection.filter = (value: string) => !value.includes('2')
    collection.sort = (a: string, b: string) => a.localeCompare(b)
    collection.pagination = { offset: 1, limit: 1 }

    expect(collection.filteredAndSorted).toEqual(['cardHash1', 'cardHash3'])
    expect(collection.paginated).toEqual(['cardHash3'])
  })
})
