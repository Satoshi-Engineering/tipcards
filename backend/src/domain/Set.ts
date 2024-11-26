import assert from 'node:assert'

import { SetDto } from '@shared/data/trpc/SetDto.js'

import { asTransaction } from '@backend/database/client.js'
import type { SetWithSettings } from '@backend/database/data/SetWithSettings.js'
import hashSha256 from '@backend/services/hashSha256.js'

import CardStatusCollection from './CardStatusCollection.js'

export default class Set {
  public static async fromId(setId: SetDto['id']): Promise<Set> {
    const set = await asTransaction(
      async (queries) => await queries.getSetById(setId),
    )
    const settings = await asTransaction(
      async (queries) => await queries.getSetSettingsBySetId(setId),
    )
    assert(set != null, `No set found for set with id ${setId}`)
    assert(settings != null, `No settings found for set with id ${setId}`)
    return Set.fromSetWithSettings({
      ...set,
      settings,
    })
  }

  public static fromSetWithSettings(setWithSettings: SetWithSettings): Set {
    const setDto = SetDto.parse(setWithSettings)
    return new Set(setDto)
  }

  public async getCardStatusCollection(): Promise<CardStatusCollection> {
    const cardHashes = this.getAllCardHashes()
    const cardStatusCollection = await CardStatusCollection.fromCardHashes(cardHashes)
    return cardStatusCollection
  }

  public getAllCardHashes(): string[] {
    return [...Array(this.set.settings.numberOfCards).keys()].map((cardIndex) => this.getCardHash(cardIndex))
  }

  public getCardHash(cardIndex: number): string {
    return hashSha256(`${this.set.id}/${cardIndex}`)
  }

  public toTRpcResponse(): SetDto {
    return this.set
  }

  public readonly set: SetDto
  private constructor(set: SetDto) {
    this.set = set
  }
}
