import { SetDto } from '@shared/data/trpc/SetDto.js'

import type { SetWithSettings } from '@backend/database/data/SetWithSettings.js'
import { Card, User } from '@backend/database/schema/index.js'
import { asTransaction } from '@backend/database/client.js'

import CardStatusCollection from './CardStatusCollection.js'
import Set from './Set.js'

export default class SetCollection {
  public static async fromUserId(userId: User['id']): Promise<SetCollection> {
    const setsWithSettings = await asTransaction(
      async (queries) => await queries.getSetsWithSettingsByUserId(userId),
    )
    return new SetCollection(setsWithSettings)
  }

  public readonly sets: Set[]

  public async getCardStatusCollection(): Promise<CardStatusCollection> {
    const cardHashes = this.getAllCardHashes()
    const cardStatusCollection = await CardStatusCollection.fromCardHashes(cardHashes)
    return cardStatusCollection
  }

  public getAllCardHashes(): Card['hash'][] {
    return this.sets.reduce<Card['hash'][]>((cardHashes, set) => [
      ...cardHashes,
      ...set.getAllCardHashes(),
    ], [])
  }

  public toTRpcResponse(): SetDto[] {
    return this.sets.map((set) => set.toTRpcResponse())
  }

  private constructor(setsWithSettings: SetWithSettings[]) {
    this.sets = setsWithSettings.map((setsWithSettings) => Set.fromSetWithSettings(setsWithSettings))
  }
}
