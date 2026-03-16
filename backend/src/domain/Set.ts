import assert from 'node:assert'
import { randomUUID } from 'crypto'

import { SetDto } from '@shared/data/trpc/SetDto.js'
import { ErrorCode, ErrorWithCode } from '@shared/data/Errors.js'

import { asTransaction } from '@backend/database/client.js'
import type { SetWithSettings } from '@backend/database/data/SetWithSettings.js'
import hashSha256 from '@backend/services/hashSha256.js'
import NotFoundError from '@backend/errors/NotFoundError.js'

import CardStatusCollection from './CardStatusCollection.js'

export default class Set {
  public static async fromId(setId: SetDto['id']): Promise<Set> {
    const set = await asTransaction(
      async (queries) => await queries.getSetById(setId),
    )
    const settings = await asTransaction(
      async (queries) => await queries.getSetSettingsBySetId(setId),
    )
    assert(set != null, new NotFoundError(`No set found for id ${setId}`))
    assert(settings != null, new ErrorWithCode(`No settings found for set with id ${setId}`, ErrorCode.SetSettingsNotFound))
    return Set.fromSetWithSettings({
      ...set,
      settings,
    })
  }

  public static fromSetWithSettings(setWithSettings: SetWithSettings): Set {
    const setDto = SetDto.parse(setWithSettings)
    return new Set(setDto)
  }

  public static fromSetDto(setDto: SetDto): Set {
    return new Set(setDto)
  }

  public static async clone(
    sourceSetId: SetDto['id'],
    newName: string,
    userId: string,
  ): Promise<Set> {
    // Load source set with settings
    const sourceSet = await Set.fromId(sourceSetId)

    // Generate new UUID for cloned set
    const newSetId = randomUUID()
    const now = new Date()

    // Create new set and settings with all operations in a single transaction
    await asTransaction(async (queries) => {
      // Insert new Set record
      await queries.insertSets({
        id: newSetId,
        created: now,
        changed: now,
      })

      // Insert new SetSettings with copied values but new name
      await queries.insertSetSettings({
        set: newSetId,
        name: newName,
        numberOfCards: sourceSet.set.settings.numberOfCards,
        cardHeadline: sourceSet.set.settings.cardHeadline,
        cardCopytext: sourceSet.set.settings.cardCopytext,
        image: sourceSet.set.settings.image,
        landingPage: sourceSet.set.settings.landingPage ?? 'default',
      })

      // Grant the cloning user full access to the new set
      await queries.insertUsersCanUseSets({
        user: userId,
        set: newSetId,
        canEdit: true,
      })
    })

    // Load and return the newly created set
    return Set.fromId(newSetId)
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
