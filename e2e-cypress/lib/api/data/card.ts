// import * as crypto from 'crypto'

import { CardStatusDto } from '@shared/data/trpc/CardStatusDto'

import { sha256 } from '@e2e/lib/cryptoHelpers'

export const generateCardHashAsync = async (): Promise<CardStatusDto['hash']> => sha256(crypto.randomUUID())

export const generateCardHash = () => cy.then(generateCardHashAsync)

export const generateCardHashForSetAsync = async (setId: string, cardIndex: number): Promise<CardStatusDto['hash']> =>
  sha256(`${setId}/${cardIndex}`)

export const generateCardHashForSet = (setId: string, cardIndex = 0) => cy.then(() => generateCardHashForSetAsync(setId, cardIndex))
