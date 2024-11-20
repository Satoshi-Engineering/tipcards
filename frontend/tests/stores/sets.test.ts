import { describe, it, expect } from 'vitest'

import '../mocks/i18n'
import '../mocks/provide'
import '../mocks/pinia'
import '../mocks/router'

describe('sets', () => {
  it('true is true', async () => {
    const trueConstant = true
    expect(trueConstant).toBe(true)
  })
})
