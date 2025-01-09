export const delayNextTrpcResponse = (delay = 1_000) => {
  cy.intercept({
    path: '/trpc/**',
    times: 1,
  }, (request) => {
    request.on('response', (response) => {
      response.setDelay(delay)
    })
  }).as('delayedRequest')
}
