import type { AccessTokenPayload } from '../data/api/AccessTokenPayload'
import { PermissionsEnum } from '../data/redis/User'

export type CheckAccessTokenPermissions = (accessTokenPayload: AccessTokenPayload) => boolean

export const canAccessStatistics = ({ permissions }: AccessTokenPayload) =>
  permissions != null && permissions.includes(PermissionsEnum.enum.statistics)
