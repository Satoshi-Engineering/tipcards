import { PermissionsEnum, type AccessTokenPayload } from '../data/User'

export type CheckAccessTokenPermissions = (accessTokenPayload: AccessTokenPayload) => boolean

export const canAccessStatistics = ({ permissions }: AccessTokenPayload) =>
  permissions != null && permissions.includes(PermissionsEnum.enum.statistics)
