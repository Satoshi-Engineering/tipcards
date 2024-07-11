import type { AccessTokenPayload } from '../data/auth/index.js'
import { PermissionsEnum } from '../data/auth/User.js'

export type CheckAccessTokenPermissions = (accessTokenPayload: AccessTokenPayload) => boolean

export const canAccessStatistics = ({ permissions }: AccessTokenPayload) =>
  permissions != null && permissions.includes(PermissionsEnum.enum.statistics)
