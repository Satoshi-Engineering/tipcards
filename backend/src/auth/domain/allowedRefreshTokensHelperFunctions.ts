import { type JWTPayload } from 'jose'
import z from 'zod'

import {
  ErrorCode,
  ErrorWithCode,
} from '@shared/data/Errors.js'

import {
  getUserById,
  updateUser,
} from '@backend/database/deprecated/queries.js'

const RefreshTokenPayload = z.object({
  id: z.string(),
  lnurlAuthKey: z.string(),
  nonce: z.string().uuid().describe('this makes sure every token is unique'),
})

type RefreshTokenPayload = z.infer<typeof RefreshTokenPayload>


export const parseJWTPayload = (jwtPayload: JWTPayload) => {
  return RefreshTokenPayload.parse(jwtPayload)
}

export const validateRefeshTokenInDatabase = async (userId: string, refreshToken: string) => {
  let user
  try {
    user = await getUserById(userId)
  } catch (error) {
    throw new ErrorWithCode(error, ErrorCode.UnknownDatabaseError)
  }
  if (
    user?.allowedRefreshTokens == null
    || !user.allowedRefreshTokens.find((currentRefreshTokens) => currentRefreshTokens.includes(refreshToken))
  ) {
    throw new ErrorWithCode('Refresh token not found in allowed refresh tokens', ErrorCode.RefreshTokenDenied)
  }
}

export const deleteAllRefreshTokensInDatabase = async (userId: string) => {
  let user
  try {
    user = await getUserById(userId)
  } catch (error) {
    throw new ErrorWithCode(error, ErrorCode.UnknownDatabaseError)
  }
  if (user == null) {
    throw new ErrorWithCode('Authenticated User not found', ErrorCode.UnknownDatabaseError)
  }
  user.allowedRefreshTokens = []
  try {
    await updateUser(user)
  } catch (error) {
    throw new ErrorWithCode(error, ErrorCode.UnableToUpdateUser)
  }
}

export const deleteRefreshTokenInDatabase = async (refreshToken: string | null) => {
  if (refreshToken == null) {
    return
  }

  try {
    const parsedToken = Buffer.from(refreshToken.split('.')[1], 'base64')
    const { id: userId } = JSON.parse(parsedToken.toString())
    const user = await getUserById(userId)
    if (user?.allowedRefreshTokens != null) {
      user.allowedRefreshTokens = user.allowedRefreshTokens
        .filter((currentRefreshTokens) => !currentRefreshTokens.includes(refreshToken))
      await updateUser(user)
    }
  } catch (error) {
    throw new ErrorWithCode(error, ErrorCode.UnknownDatabaseError)
  }
}

