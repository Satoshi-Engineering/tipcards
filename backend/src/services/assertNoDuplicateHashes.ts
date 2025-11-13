import DuplicateHashesError from '@backend/errors/DuplicateHashesError.js'

export function assertNoDuplicateHashes(hashes: string[]) {
  const seen = new Set<string>()

  for (const hash of hashes) {
    if (seen.has(hash)) {
      throw new DuplicateHashesError(`Duplicate card hashes detected: ${hash}`)
    } else {
      seen.add(hash)
    }
  }
}
