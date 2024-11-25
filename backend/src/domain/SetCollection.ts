import { SetDto } from '@shared/data/trpc/SetDto.js'
import { User } from '@backend/database/schema/User.js'

import { asTransaction } from '@backend/database/client.js'

export default class SetCollection {
  public static async fromUserId(userId: User['id']): Promise<SetCollection> {
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
