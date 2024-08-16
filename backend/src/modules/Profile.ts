import { asTransaction } from '@backend/database/client.js'
import { Profile as ProfileData } from '@backend/database/schema/Profile.js'

import { Profile as ProfileDto } from '@shared/data/trpc/Profile.js'

export default class Profile {
  /** @throws */
  public static async fromUserIdOrDefault(userId: ProfileData['user']) {
    const profile = await asTransaction((queries) => queries.getProfileByUserId(userId))
    if (profile == null) {
      return this.initProfile(userId)
    }
    return new Profile(profile)
  }

  public static initProfile(userId: ProfileData['user']) {
    return new Profile({
      user: userId,
      accountName: '',
      displayName: '',
      email: '',
    })
  }

  /** @throws */
  public toTRpcResponse() {
    return ProfileDto.parse(this.profile)
  }

  /** @throws */
  public async update(data: Partial<Omit<ProfileData, 'user'>>) {
    this.profile = {
      ...this.profile,
      ...data,
    }
    await asTransaction((queries) => queries.insertOrUpdateProfile(this.profile))
  }

  private profile: ProfileData
  private constructor(profile: ProfileData) {
    this.profile = profile
  }
}
