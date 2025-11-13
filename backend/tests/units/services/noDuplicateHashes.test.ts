import { describe, it, expect } from 'vitest'

import DuplicateHashesError from '@backend/errors/DuplicateHashesError.js'
import { assertNoDuplicateHashes } from '@backend/services/assertNoDuplicateHashes.js'

describe('assertNoDuplicateHashes', () => {
  it('does nothing when no duplicates are present', () => {
    expect(() => assertNoDuplicateHashes(['a', 'b', 'c'])).not.toThrow()
  })

  it('throws an error when a duplicate exists', () => {
    expect(() => assertNoDuplicateHashes(['a', 'b', 'a'])).toThrowError(DuplicateHashesError)
  })

  it('handles empty arrays without throwing', () => {
    expect(() => assertNoDuplicateHashes([])).not.toThrow()
  })

  it('handles arrays with a single element without throwing', () => {
    expect(() => assertNoDuplicateHashes(['abc'])).not.toThrow()
  })
})
