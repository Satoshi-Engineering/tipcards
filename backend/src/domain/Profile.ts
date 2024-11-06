import { ProfileDto } from '@shared/data/trpc/ProfileDto.js'

import { asTransaction } from '@backend/database/client.js'
import { Profile as ProfileSchema } from '@backend/database/schema/Profile.js'

export default class Profile {
  /** @throws */
  public static async fromUserIdOrDefault(userId: ProfileSchema['user']) {
    const profile = await asTransaction((queries) => queries.getProfileByUserId(userId))
    if (profile == null) {
      return this.initProfile(userId)
    }
    return new Profile(profile)
  }

  public static initProfile(userId: ProfileSchema['user']) {
    return new Profile(Profile.createEmptyProfile(userId))
  }

  public static createEmptyProfile(userId: ProfileSchema['user']) {
    return {
      user: userId,
      accountName: '',
      displayName: '',
      email: '',
    }
  }

  /** @throws */
  public toTRpcResponse() {
    return ProfileDto.parse(this.profile)
  }

  /** @throws */
  public async update(data: Partial<Omit<ProfileSchema, 'user'>>) {
    this.profile = {
      ...this.profile,
      ...data,
    }
    await asTransaction((queries) => queries.insertOrUpdateProfile(this.profile))
  }

  private profile: ProfileSchema
  private constructor(profile: ProfileSchema) {
    this.profile = profile
  }
}
