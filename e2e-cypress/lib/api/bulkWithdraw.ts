// load the global Cypress types
/// <reference types="cypress" />

import { CardStatusDto } from '@shared/data/trpc/CardStatusDto'

import { BACKEND_API_ORIGIN } from '@e2e/lib/constants'

const API_CREATE_BULKWITHDRAW = new URL('/trpc/bulkWithdraw.createForCards', BACKEND_API_ORIGIN)

export const startBulkWithdraw = (...cardHashes: Array<CardStatusDto['hash']>) =>
  cy.request({
    url: API_CREATE_BULKWITHDRAW.href,
    method: 'POST',
    body: { json: cardHashes },
  })
