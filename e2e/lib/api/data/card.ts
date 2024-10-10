// import * as crypto from 'crypto'

import { CardStatusDto } from '@shared/data/trpc/tipcards/CardStatusDto'

import { sha256 } from '@e2e/lib/cryptoHelpers'

export const generateCardHash = async (): Promise<CardStatusDto['hash']> => sha256(crypto.randomUUID())
