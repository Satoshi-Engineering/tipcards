import './commands'

Cypress.on('uncaught:exception', (err) => {
  if (err.message.includes("Failed to execute 'close' on 'ReadableStreamDefaultController'")) {
    return false
  }
  return true
})
