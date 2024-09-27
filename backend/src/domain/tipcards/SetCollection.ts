import { SetDto } from '@shared/data/trpc/tipcards/SetDto.js'

import { asTransaction } from '@backend/database/client.js'

export default class SetCollection {
  public static async fromUserId(userId: string): Promise<SetCollection> {
    const setsWithSettings = await asTransaction(
      async (queries) => await queries.getSetsWithSettingsByUserId(userId),
    )
    const setsWithParsedSettings = setsWithSettings.map(
      (setWithSettings) => SetDto.parse(setWithSettings),
    )
    return new SetCollection(setsWithParsedSettings)
  }

  public readonly sets: SetDto[]
  private constructor(sets: SetDto[]) {
    this.sets = sets
  }
}
