import { vi } from 'vitest'

vi.mock('@/constants', async (importOriginal) => {
  const actual: object = await importOriginal()
  return {
    ...actual,
    LIGHTNING_NODE_NAME: 'TheLightningNode',
    LIGHTNING_NODE_LINK: 'https://lightning.node',
  }
})
