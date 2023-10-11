import type { User } from '../../../src/data/redis/User'
import { ErrorCode } from '../../../src/data/Errors'

import { getAllUsers } from '../services/database'

const alreadyReportedDuplicates = new Set()

const checkDuplicateLnurlAuthKeys = async () => {
  let allUsers: User[] = []
  try {
    allUsers = await getAllUsers()
  } catch (error) {
    console.error(ErrorCode.UnableToGetAllUsers, error)
  }
  
  const userIdsByLnurlAuthKey: Record<string, string[]> = {}
  const duplicatesToReport: Record<string, string[]> = {}

  allUsers.forEach((user) => {
    const previouslyFoundIds = userIdsByLnurlAuthKey[user.lnurlAuthKey]
    const userIdsForLnurlAuthKey = []
    if (Array.isArray(previouslyFoundIds)) {
      userIdsForLnurlAuthKey.push(...previouslyFoundIds)
    }
    userIdsForLnurlAuthKey.push(user.id)
    userIdsByLnurlAuthKey[user.lnurlAuthKey] = userIdsForLnurlAuthKey
    
    if (previouslyFoundIds != null && !alreadyReportedDuplicates.has(user.lnurlAuthKey)) {
      duplicatesToReport[user.lnurlAuthKey] = userIdsForLnurlAuthKey
    }
  })

  const numberOfDuplicatesToReport = Object.entries(duplicatesToReport).length
  if (numberOfDuplicatesToReport > 0) {
    console.error(
      ErrorCode.FoundMultipleUsersForLnurlAuthKey,
      `Found multiple users for ${numberOfDuplicatesToReport} lnurlAuthKey(s) in the users database.`,
      ...Object.values(duplicatesToReport)
        .map((val) => `userIds: ${val.join(', ')}`),
    )

    Object.keys(duplicatesToReport).forEach((key) => alreadyReportedDuplicates.add(key))
  }
}

export default checkDuplicateLnurlAuthKeys
