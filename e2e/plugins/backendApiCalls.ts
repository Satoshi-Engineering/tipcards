/// <reference types="cypress" />

import axios from 'axios'

import { Set } from '../../shared/src/data/api/Set'

// This function is the entry point for plugins
export default (on: Cypress.PluginEvents, config: Cypress.PluginConfigOptions) => {
  let BACKEND_API_ORIGIN: string

  on('before:run', () => {
    BACKEND_API_ORIGIN = String(process.env.BACKEND_API_ORIGIN)
  })

  on('task', {
    async createInvoicesForSetsParallel({ sets, amountPerCard = 21 }: { sets: Set[], amountPerCard: number }) {
      const API_SET_INVOICE = new URL('/api/set/invoice', BACKEND_API_ORIGIN)

      await Promise.all(sets.map((set) =>
        axios.request({
          url: `${API_SET_INVOICE.href}/${set.id}`,
          method: 'POST',
          data: {
            amountPerCard,
            cardIndices: [...new Array(set.settings.numberOfCards).keys()],
          },
        }),
      ))
      return null
    },
  })

  return {
    ...config,
    taskTimeout: 5 * 60 * 1000,
    timeout: 5 * 60 * 1000,
  }
}
