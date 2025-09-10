/// <reference types="cypress" />

import clipboardy from 'clipboardy'

// This function is the entry point for plugins
export default (on: Cypress.PluginEvents, config: Cypress.PluginConfigOptions) => {
  on('task', {
    getClipboard() {
      return clipboardy.readSync()
    },
    setClipboard(text: string) {
      clipboardy.writeSync(text)
      return null
    },
  })

  return config
}
